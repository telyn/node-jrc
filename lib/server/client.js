constants = require("../constants.js");
require("./message.js");
Client = function(server,stream) {
    this.name = null;
    this.room = null;
    this.server = server;
    this.stream = stream;
    this.address = stream.remoteAddress+":"+stream.remotePort;

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
                        server.sendAutowhois(self);
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
                case constants.NUMERICINFO:
                    if(message.params[0] == constants.USERINFO) {
                        server.sendServerUserList(self);
                    } else if(message.params[0] == constants.ROOMINFO) {
                        server.sendRoomList(self);
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
        for(var i =0; i<params.length; i++) {
            var p = params[i];
            if(typeof(p) == "object") {
                for(var key in p) {
                    paramstr += key + constants.FIELD_SEPERATOR + p[key] + constants.RECORD_SEPERATOR;
                }
                paramstr += "\t";
            } else {
                paramstr += p.toString() + "\t";
            }
        }
        var str = command+paramstr.slice(0,paramstr.length-1);
        console.log("--> "+self.address + " " + str);
        self.stream.write(str+"\r\n");
    };

    // messages
    this.leave = function(reason) {
        self.send(constants.LEAVE,self.name,reason);
    };

    this.receiveChallenge = function(challenge) {
        self.send([constants.SERVERMESSAGE, constants.SERVERCHALLENGE], challenge);
    };

    this.receiveServerUserList = function(userlist) {
        self.send([constants.NUMERICINFO, constants.USERINFO], "","a"+userlist.join("\t"));
    };

    this.receiveRoomList = function(roomlist) {
        self.send([constants.NUMERICINFO, constants.ROOMINFO], "", "b"+roomlist.join("\t"));
    };

    this.receiveJoinedRoom = function(room) {
        self.send(constants.JOIN,self.name,room);
    };

    this.receiveAutowhois = function(whois) {
        self.send(constants.WHOIS,"",constants.INFO+constants.USERINFO+self.name,whois);
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
