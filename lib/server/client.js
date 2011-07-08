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
        self.receivePrivateMessage("Server","Hello!");
        server.joinRoom(self,"Creatures");
    };
    stream.addListener('connect',this.connectionHandler);

    this.dataHandler = function(data) {
        data = data.trim();
        message = new Message(data);
        console.log("<--",self.address,JSON.stringify(data));
        message.print();
        switch(message.command) {
            case constants.MESSAGE_WHOIS:
                if(message.subcommand == constants.MESSAGE_NAME) {
                   self.name = message.params[1];
                }
                break;
            case constants.MESSAGE_MESSAGE:
                server.sendMessage(self.name,self.room,message.params[0]);
                break;
        }
    };
    stream.addListener('data',this.dataHandler);

    this.endHandler = function() {
        self.stream = null;
        server.removeClient(self);
        self = null;
    };
//    stream.addListener('close',this.closeHandler);
    stream.addListener('end',this.endHandler);

    this.receiveJoinedRoom = function(room) {
       self.stream.write("Eserver\tJoined "+room+"\r\n");
    };

    this.receiveRegularMessage = function(from,message) {
        self.stream.write("E"+from+"\t"+message+"\r\n");
    };

    this.receivePrivateMessage = function(from,message) {
        self.stream.write("F"+from+"\t"+message+"\r\n");
    };
};
