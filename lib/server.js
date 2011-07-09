var net = require("net");
var EventEmitter = require("events").EventEmitter;
require("./server/client.js");

exports.createServer = function(bind_address) {
    return new Server(bind_address);
};

function Server(bind_address) {
    this.address = bind_address;
    this.port = 0;
    var clients = [];
    var gags;
    var bans;
    var keepouts;
    var rooms = { 'Creatures': [], 'Creatures RPG': [] };
    var clientsbyname = {};
    var self = this;

    var jrcListener = net.createServer(
        function(socket) {
            console.log("New client: "+socket.remoteAddress);
            socket.setEncoding("ASCII");
            clients.push(new Client(self,socket));

        }
    );

    this.boundHandler = function() {
       console.log("Listening on "+self.address+":"+self.port);
    };

    this.listen = function(port) {
       this.port = port;
       jrcListener.listen(port,this.address,this.boundHandler);
    };


    this.removeClient = function(client) {
       clients.splice(clients.indexOf(client),1);
       for(x in rooms) {
           var room = rooms[x];
           var pos = room.indexOf(client);
           if(pos != -1) {
                room.splice(pos,1);
           }
       }
       console.log("Removing client "+client.address);
    };

    jrcListener.on('error',function(e) {
        if( e.code == 'EADDRINUSE') {
            console.log('Address in use, retrying.');
            setTimeout(function() {
                jrcListener.listen(this.port,this.address,this.boundHandler);
            },1000);
        }
    });

    // Below this all are actions
    //

    this.setName = function(client,newname) {
        for(name in clientsbyname) {
            if(clientsbyname[name] == client) {
                delete clientsbyname[name];
            }
        }
        clientsbyname[newname] = client;
        client.name = newname;

    };
   
    this.sendUserList = function(client) {

    };

    this.sendRoomList = function(client) {
        var roomlist = [];
        for(room in rooms) {
            roomlist.push(room);
        }
        client.receiveRoomList(roomlist);
    };


    this.joinRoom = function(client,room) {
       if(rooms[room] !== null) {
            rooms[room].push(client);
            client.room = room;
            client.receiveJoinedRoom(room);
        }
    };
    
    this.sendMessage = function(from,room,message) {
        if(room === null || room === "") {
            throw { 
                name: "NullRoomError",
                message: "Room is null."
            };
        } else {
            for(i=0;i<rooms[room].length;i++) {
                client = rooms[room][i];
                client.receiveRegularMessage(from,message);
            }
        }
    };

    this.sendPrivateMessage = function(from,destinations,message) {
        for(i=0;i<destinations.length;i++) {
            clientsbyname[from].sentPrivateMessage(destinations[i],message);
            clientsbyname[destinations[i]].receivePrivateMessage(from,message);
        }
    };
}

Server.prototype = EventEmitter;
Server.prototype.constructor = Server;
