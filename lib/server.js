var net = require("net");
var EventEmitter = require("events").EventEmitter;
var Client = require("./server/client.js");
var errors = require("./errors.js");
var constants = require("./constants.js");

exports.createServer = function(bind_address) {
    return new Server(bind_address);
};

function Server(bind_address) {
    this.address = bind_address;
    this.port = 0;
    var clients = [];
    var gags = {};
    var bans = {};
    var keepouts = {};
    var rooms = { 'Creatures': [], 'Creatures RPG': [] };
    var nametoroom = {};
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
       delete nametoroom[client.name];
       delete clientsbyname[client.name];
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

    // optional second argument includeName
    this.buildWhois = function(name) {
        var client = clientsbyname[name];
        if(client === null || client === undefined) {
            throw errors.UserNotFoundError("User " + name + " not found", {user:name});
        } else {
            var whois = {
                Room: nametoroom[name],
                IP:  client.stream.remoteAddress, //FIXME
                Access: constants.LEVEL_USER,
                Client: client.client,
                Idle: '3m20s',
                Login: '5m32s'
            };
            if(arguments[1]) {
                whois.name = name;
            }
            return whois;
        }
    };

    // **************************
    // Below this all are actions
    // **************************

    this.setName = function(client,newname) {
        var oldname;
        if(clientsbyname[newname] !== undefined) {
            throw errors.NameTakenError("Username already taken",{newname:newname});
        }
        for(var name in clientsbyname) {
            if(clientsbyname[name] == client) {
                oldname = name;
                delete clientsbyname[name];
                break;
            }
        }
        clientsbyname[newname] = client;
        client.name = newname;
        if(nametoroom[oldname] !== undefined) {
            nametoroom[newname] = nametoroomw[oldname];
            delete nametoroom[oldname];
        }

    };

    //NUMERICINFO and GENERALINFO
    this.sendServerUserCount = function(client) {
        client.receiveServerUserCount(clients.length);
    };
   
    this.sendServerUserList = function(client) {
        var names = [];
        for(var name in clientsbyname) {
            names.push(name);
        }
        client.receiveServerUserList(names);
    };

    this.sendRoomList = function(client) {
        var roomlist = [];
        for(var room in rooms) {
            roomlist.push(room);
        }
        client.receiveRoomList(roomlist);
    };

    this.sendRoomUserList = function(client,room) {
        if(rooms[room] !== undefined) {
            client.receiveRoomUserList(room,
                rooms[room].map(function(c) {
                    return c.name;
                })
            );
        }
    };

    // *****
    // whois
    // *****
    this.sendWhois = function(client,who) {
        client.receiveWhois(who,self.buildWhois(who));
    };

    this.sendEntrywhois = function(client,who) {
        client.receiveEntrywhois(who,self.buildWhois(who));
    };

    this.sendRoomAutowhois = function(client) {
       whois = [];
       var room = rooms[nametoroom[client.name]];
       
       for(i=0; i<room.length; i++) {
           client.receiveAutowhois(room[i].name,self.buildWhois(room[i].name));
       }
    };

    this.sendAutowhois = function(client,who) {
       client.receiveAutowhois(who,whois.push(self.buildWhois(who)));
    };

    // other


    this.joinRoom = function(client,room) {
        if(room === null || room === "" || room === undefined) {
            throw errors.NullRoomError("Room is null.");
        } else if(rooms[room] === undefined) {
            throw errors.RoomNotFoundError("Room not found",{room:room});
        } else {
            var prevroom = nametoroom[client.name];
            
            if(prevroom == room) {
                return;
            }

            rooms[room].push(client);
            client.room = room;
            nametoroom[client.name] = room;
            

            for(i=0; i<rooms[room].length; i++) {
                rooms[room][i].receiveJoinedRoom(client.name,room);
            }


            if(prevroom !== null && prevroom !== undefined) {
                if(rooms[prevroom] !== undefined) {
                    rooms[prevroom].splice(rooms[prevroom].indexOf(client),1);
                    for(i=0; i<rooms[prevroom].length; i++) {
                        rooms[prevroom][i].receiveLeftRoom(client.name,room);
                    }
                }
            }
        }
    };
    
    this.sendMessage = function(from,room,message) {
        if(room === null || room === "") {
            throw NullRoomError("Room is null.");
        } else {
            for(i=0;i<rooms[room].length;i++) {
                client = rooms[room][i];
                client.receiveRegularMessage(from,message);
            }
        }
    };

    this.sendPrivateMessage = function(from,destinations,message) {
        for(var i=0; i<destinations.length; i++) {
            if(clientsbyname[destinations[i]] !== undefined) {
                clientsbyname[from].sentPrivateMessage(destinations[i],message);
                clientsbyname[destinations[i]].receivePrivateMessage(from,message);
            }
        }
    };
}

Server.prototype = EventEmitter;
Server.prototype.constructor = Server;
