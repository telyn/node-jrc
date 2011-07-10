constants = require("../constants.js");
require("./message.js");
Client = function(server,stream) {
    this.name = null;
    this.client = null;
    this.room = null;
    this.server = server;
    this.stream = stream; //FIXME should be var not this
    this.address = stream.remoteAddress+":"+stream.remotePort; //FIXME should be a public way of getting remoteAddress.

    var self = this;
    this.connectionHandler = function() {

    };
    stream.addListener('connect',this.connectionHandler);

    this.endHandler = function() {
        self.stream = null;
        server.removeClient(self);
        self = null;
    };
    stream.addListener('end',this.endHandler);

    this.dataHandler = function(data) {

        data = data.trim();
        data = data.split("\n");

        for(var i=0; i<data.length; i++) {
            message = new Message(data[i]);
            console.log("<--",self.address,JSON.stringify(data[i]));
            message.print();
            switch(message.command) {
                case constants.WHOIS:
                    if(message.subcommand == constants.NAME) {
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
                        } else {
                            server.sendSelfAutowhois(self);
                        }
                    }
                    break;
                case constants.SERVERCHALLENGE:
                    var correct_answer =  (self.challenge  * Math.floor(self.challenge / 10) ) % 100000;
                    if(message.params[0] == correct_answer) {
                        console.log("Challenge succeeded.");
                    } else {
                        console.log(message.params[0] + " =/= "+correct_answer);
                        self.leave("Challenge failed");
                        self.stream.close();
                        server.removeClient(self);
                        self = null;
                    }
                    break;
                case constants.GENERALINFO:
                    if(message.params[0] == constants.USERINFO) {
                        server.sendServerUserList(self);
                    } else if(message.params[0] == constants.ROOMINFO) {
                        server.sendRoomList(self);
                    } else if(message.params[0] == constants.ROOMUSERLIST) {
                        server.sendRoomUserList(self, message.params[1]);
                    }
                    break;
                case constants.JOIN:
                    server.joinRoom(self,message.params[0]);
                    break;
                case constants.MESSAGE:
                    server.sendMessage(self.name,self.room,message.params[0]);
                    break;
                case constants.PRIVATEMESSAGE:
                    server.sendPrivateMessage(self.name,message.params.slice(0,message.params.length-1),message.params[message.params.length-1]);
                    break;
            }
        }
    };
    stream.addListener('data',this.dataHandler);

    this.send = function(commandarr) {
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
        console.log("--> "+self.address + " " + JSON.stringify(str));
        self.stream.write(str+"\r\n");
    };

    // messages
    this.leave = function(reason) {
        self.send(constants.LEAVE,self.name,reason);
    };

    this.receiveChallenge = function(challenge) {
        self.send([constants.SERVERMESSAGE, constants.SERVERCHALLENGE], challenge);
    };

    this.receiveServerUserCount = function(count) {
        self.send([constants.GENERALINFO,constants.USERINFO],"","a"+count);
    };

    this.receiveServerUserList = function(userlist) {
        self.send([constants.GENERALINFO, constants.USERINFO], "","a"+userlist.join("\t"));
    };

    this.receiveRoomList = function(roomlist) {
        self.send([constants.GENERALINFO, constants.ROOMINFO], "", "b"+roomlist.join("\t"));
    };
    this.receiveRoomUserList = function(room,userlist) {
        self.send([constants.GENERALINFO,constants.ROOMUSERLIST],"","c"+room,userlist.join("\t"));
    }

    this.receiveJoinedRoom = function(who,room) {
        self.send(constants.JOIN,who,room);
    };

    this.receiveAutowhois = function(name,whois) {
        self.send(constants.WHOIS,"","autowhois",constants.INFO+constants.USERINFO+name,whois);
    };

    this.receiveSelfAutowhois = function(whois) {

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
};
