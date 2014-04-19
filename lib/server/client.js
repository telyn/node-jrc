var constants = require("../constants.js");
var Message = require("../message.js");

module.exports = Client = function(server,stream) {
    this.name = null;
    this.client = null;
    this.room = null;
    this.server = server;
    this.ipAddress = stream.remoteAddress;
    this.fullAddress = stream.remoteAddress+":"+stream.remotePort; 
    this.newname = null; // for storing until a name is set.
    this.handleErrors = true; // for disabling error handling for testing

    var self = this;
    self.log = function(str) {
        if(server.debug && !server.silent) {
            console.log(str);
        }
    };

    stream.setKeepAlive(true,20000);
//    stream.setTimeout(180000);

    this.connectionHandler = function() {

    };
    stream.addListener('connect',this.connectionHandler);

    this.endHandler = function() {
        server.removeClient(self);
        stream = null;
        self = null;
    };
    stream.addListener('end',this.endHandler);
    
    stream.addListener('timeout',function() { stream.end(); });

    this.dataHandler = function(data) {

        data = data.trim();
        data = data.split("\n");

        for(var i=0; i<data.length; i++) {
            try {
                var message = new Message(data[i]);
                self.log("<-- " + self.fullAddress + " " +JSON.stringify(data[i]));
                message.print(self.log);
                switch(message.command) {

                    case constants.WHOIS:
                        if(message.subcommand == constants.NAME) {
                            self.newname = message.params[1];
                            self.client = message.params[0];
                            server.setName(self,message.params[1]);
                            self.challenge = Math.round(Math.random()*70000);
                            self.receiveChallenge(self.challenge);
                        } else if(message.subcommand == constants.INFO) {
                            if(message.subsubcommand == constants.USERINFO) {
                                if(message.params[0] == "entrywhois") {
                                    server.sendEntrywhois(self,message.params[1]);
                                } else if(message.params[0] == "whois") {
                                    server.sendWhois(self,message.params[1]);
                                } else if(message.params[0] == "autowhois") {
                                    server.sendAutowhois(self,message.params[1]);
                                }
                            } else if(message.subsubcommand == constants.ROOMUSERLIST) {
                                if(message.params[0] == "autowhois") {
                                    server.sendRoomAutowhois(self);
                                }
                            } 
                        }
                        break;

                    case constants.SERVERCHALLENGE:
                        var correct_answer =  ( self.challenge  * Math.floor(self.challenge / 10) ) % 100000;
                        if(message.params[0] == correct_answer) {
                            self.log("Challenge succeeded.");
                        } else {
                            self.log(message.params[0] + " =/= "+correct_answer);
                            self.leave("Challenge failed");
                            stream.close();
                            server.removeClient(self);
                            self = null;
                        }
                        break;

                    case constants.GENERALINFO:
                        switch(message.subcommand) {
                            case constants.USERINFO:
                                server.sendServerUserList(self.name);
                                break;
                            case constants.ROOMINFO:
                                server.sendRoomList(self.name);
                                break;
                            case constants.ROOMUSERLIST:
                                server.sendRoomUserList(self.name, message.params[0]);
                                break;
                        }
                        break;

                    case constants.NUMERICINFO:
                        switch(message.subcommand) {
                            case constants.USERINFO:
                                server.sendServerUserCount(self.name);
                                break;
                            case constants.ROOMINFO:
                                server.sendRoomCount(self.name);
                                break;
                            case constants.ROOMUSERLIST:
                                server.sendRoomUserCount(self.name, message.params[0]);
                                break;
                            case constants.MAIL:
                                server.sendInboxCount(self.name)
                                break;
                        };
                        break;

                    case constants.JOIN:
                        server.joinRoom(self.name, message.params[0]);
                        break;

                    case constants.MESSAGE:
                        server.sendMessage(self.name, self.room,message.params[0]);
                        break;

                    case constants.PRIVATEMESSAGE:
                        server.sendPrivateMessage(self.name, message.params.slice(0,message.params.length-1),message.params[message.params.length-1]);
                        break;

                    case constants.PASSWORD:
                        if(message.subcommand == constants.USERINFO) {
                            server.setName(self,self.newname,message.params[0]);
                            self.name = self.name;
                            self.challenge = Math.round(Math.random()*70000);
                            self.receiveChallenge(self.challenge);
                        }
                        break;

                    case constants.MAIL:
                        if(message.params.length > 1) {
                            server.sendMailTo(self.name,message.params.slice(0,message.params.length-1), message.params[message.params.length-1]);
                        } else {
                            server.sendInbox(self.name);
                        }
                        break;
                        
                    case constants.BAN:
                        if(!message.undo) {
                            server.setBan(self, message.params[0], message.time);
                        } else {
                            server.unsetBan(self,message.params[0]);
                        }
                        break;
                }
            } catch(error) {
                if(self.handleErrors) {
                    self.handleError(error);
                } else {
                    throw error;
                }
                
            }
        }
    };
    stream.addListener('data',this.dataHandler);

    this.send = function(commandarr) {
        self.log(JSON.stringify(arguments));
        var command = commandarr;
        if(typeof(commandarr) == "object") {
            command = "";
            for(var i=0; i<commandarr.length; i++) {
                command += commandarr[i];
            }
        }
        var params = Array.prototype.slice.call(arguments,1);
        var paramstr = "";

        function formatWhois(whois) {
            var whoistr = "";
            if(whois.name !== undefined) {
                whoistr += whois.name + "\t";
            }
            for(var key in whois) {
                if(key != "name") {
                    whoistr += key + constants.FIELD_SEPARATOR + whois[key] + constants.RECORD_SEPARATOR;
                }
            }
            return whoistr;
        }

        for(var i =0; i<params.length; i++) {
            var param = params[i];
            if(typeof(param) == "object") {
                paramstr += formatWhois(param);
            } else {
                paramstr += param.toString() + "\t";
            }
        }
        var str = command+paramstr;
        if(str[str.length-1]=="\t") {
            str = str.slice(0,str.length-1);
        }
        self.log("--> "+self.fullAddress + " " + JSON.stringify(str));
        stream.write(str+"\r\n");
    };

    // messages
    this.leave = function(reason) {
        self.send([constants.SERVERMESSAGE,constants.LEAVE],reason);
    };

    this.receiveLeftRoom = function(who,room) {
        self.send(constants.LEAVE,who,room);
    };

    this.receiveChallenge = function(challenge) {
        self.send([constants.SERVERMESSAGE, constants.SERVERCHALLENGE], challenge);
    };

    this.receiveServerUserCount = function(count) {
        self.send([constants.NUMERICINFO],"","a"+count); // ?? Ga\t\ta2 why does JRNet expect the subcommand to be here?
    };

    this.receiveServerUserList = function(userlist) {
        self.send([constants.GENERALINFO], "","a"+userlist.join("\t")); // ??
    };

    this.receiveRoomList = function(roomlist) {
        self.send([constants.GENERALINFO], "", "b"+roomlist.join("\t")); // ??
    };

    this.receiveRoomUserList = function(room,userlist) {
        self.send([constants.GENERALINFO],"","c"+room,userlist.join("\t")); // ??
    };

    this.receiveJoinedRoom = function(who,room) {
        self.send(constants.JOIN,who,room);
    };

    this.receiveInboxCount = function(number) {
        self.send([constants.NUMERICINFO,constants.MAIL],number)
    };

    this.receiveWhois = function(name,whois) {
        self.send(constants.WHOIS,"","whois",constants.INFO+constants.USERINFO+name,whois);
    };
    this.receiveAutowhois = function(name,whois) {
        self.send(constants.WHOIS,"","autowhois",constants.INFO+constants.USERINFO+name,whois);
    };


    this.receiveRoomAutowhois = function(name,whois) {
        self.send(constants.WHOIS,"","autowhois",constants.INFO+constants.ROOMUSERLIST+name,whois);
    };

    this.receiveEntrywhois = function(name,whois) {
        self.send(constants.WHOIS,"","entrywhois",constants.INFO+constants.USERINFO+name,whois);
    };

    this.receiveRegularMessage = function(from,message) {
        self.send(constants.MESSAGE,from,message);
    };

    this.sentPrivateMessage = function(to,message) {
        self.send(constants.PRIVATEMESSAGE,self.name,to,message);
    };

    this.receivePrivateMessage = function(from,message) {
        self.send(constants.PRIVATEMESSAGE,from,message);
    };

    this.receiveMail = function(from, to, message) {
        self.send([constants.MAIL],from,to.join("\t"),message);
    };

    this.handleError = function(error) {
       switch(error.name) {
           case "NullRoomError":
               //just do nothing! This makes most sense because this way null users don't find out
               break;
           case "RoomNotFoundError":
               self.send([constants.REQUESTFAILED,constants.NOTFOUND,constants.ROOMINFO],error.room);
               break;
           case "UserNotFoundError":
               self.send([constants.REQUESTFAILED,constants.NOTFOUND,constants.USERINFO],error.user);
               break;
           case "UsersNotFoundError":
               self.send([constants.REQUESTFAILED,constants.NOTFOUND,constants.USERINFO],error.users.join("\t"));
               break;
           case "NameTakenError":
               // This is identical to the error message given by the original JRC server
               // JRNet is hard-coded to use this prompt the user to get a new name.
               // For this reason I have left it so, rather than use a more expressive string.
               self.leave("Name in use.");
               break;
           case "PasswordRequiredError":
               self.send([constants.SERVERMESSAGE,constants.PASSWORD],error.username);
               break;
           case "WrongPasswordError":
               self.send([constants.REQUESTFAILED,constants.ACCESSDENIED,constants.USERINFO],error.username);
               self.leave("Wrong password.");
               break;
           case "AccessDeniedToBanError":
               self.send([constants.REQUESTFAILED,constants.ACCESSDENIED,constants.BAN],error.address);
               break;
            case "NoMailError":
                self.send([constants.REQUESTFAILED,constants.NOTFOUND,constants.MAIL]);
                break;
           default:
               throw error;
       }
    };
};