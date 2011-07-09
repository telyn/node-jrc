constants = require("../constants.js");
require("./message.js");
Client = function(server,stream) {
    this.name = null;
    this.room = null;
    this.server = server;
    this.stream = stream;
    this.address = stream.remoteAddress;

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
        data = data.split("\r\n");
        for(i=0;i<data.length;i++) {
            message = new Message(data[i]);
            console.log("<--",self.address,JSON.stringify(data[i]));
            message.print();
            switch(message.command) {
                case constants.WHOIS:
                    if(message.subcommand == constants.NAME) {
                        server.setName(self,message.params[1]);
                        self.challenge = Math.round(Math.random()*70000);
                        self.receiveChallenge(self.challenge);
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
                        server.sendUserList(self);
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

    // messages
    this.receiveChallenge = function(challenge) {
        self.stream.write(constants.SERVERMESSAGE+constants.SERVERCHALLENGE+challenge.toString()+"\r\n");
    };

    this.receiveRoomList = function(roomlist) {
        self.stream.write(constants.NUMERICINFO+constants.ROOMINFO+roomlist.join("\t")+"\r\n");
    };

    this.receiveJoinedRoom = function(room) {
        self.stream.write("D"+self.name+"\t"+room+"\r\n");
    };

    this.receiveRegularMessage = function(from,message) {
        self.stream.write("E"+from+"\t"+message+"\r\n");
    };

    this.sentPrivateMessage = function(to,message) {
        // TODO: Haven't worked out the right format for this.
    };

    this.receivePrivateMessage = function(from,message) {
        self.stream.write("F"+from+"\t"+message+"\r\n");
    };
};
