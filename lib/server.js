var net = require("net");
var crypto = require("crypto");
var EventEmitter = require("events").EventEmitter;
var Client = require("./server/client.js");
var errors = require("./errors.js");
var constants = require("./constants.js");


var Server = function(bind_address,configuration,state) {
    this.address = bind_address;
    this.port = 0;
    var clients = [];
    var gags = {};
    var bans = state.bans || {};
    var keepouts = {};
    var rooms = { 'Creatures': [], 'Creatures RPG': [] };
    var nametoroom = {};
    var clientsbyname = {};
    var levels = {};

    console.log(JSON.stringify(bans));

    if(configuration.masters === undefined) {
        configuration.masters = {};
    }
    var mcount = 0;
    for(var m in configuration.masters) {
        levels[m] = constants.LEVEL_MASTER;
        mcount++;
    }

    console.log(mcount + " masters.");


    var self = this;

    var jrcListener = net.createServer(
        function(socket) {
            console.log("New client: "+socket.remoteAddress);
            socket.setEncoding("ASCII");
            var client = new Client(self,socket);
            if(bans[socket.remoteAddress] !== undefined) {
                client.leave("You have been banned from this server.");
            }
            clients.push(client);

        }
    );

    this.saveState = function() {
        return JSON.stringify({
            gags: gags,
            bans: bans,
            keepouts: keepouts
        });
    };

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

    var buildWhois = function(name) {
        var client = clientsbyname[name];
        if(client === null || client === undefined) {
            throw errors.UserNotFoundError("User " + name + " not found", {user:name});
        } else {
            var whois = {
                Room: nametoroom[name],
                IP:  client.stream.remoteAddress, //FIXME
                Access: levels[name] || constants.LEVEL_USER,
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

    var moveUserToRoom = function(name,room) {
        var prevroom = nametoroom[name];
        var client = clientsbyname[name];

        if(client === undefined) {
            throw errors.UserNotFoundError("User not found",{user:name});
        }

        if(rooms[room] === undefined && room !== "") {
            throw errors.RoomNotFoundError("Room not found",{room:room});
        }

        if(prevroom == room) {
            return;
        }

        if(room !== "") {
            rooms[room].push(client);
            for(i=0; i<rooms[room].length; i++) {
                rooms[room][i].receiveJoinedRoom(name,room);
            }
            nametoroom[client.name] = room;
        } else {
            delete nametoroom[client.name];
        }

        client.room = room;

        if(prevroom !== null && prevroom !== undefined) {
            if(rooms[prevroom] !== undefined) {
                rooms[prevroom].splice(rooms[prevroom].indexOf(client),1);
                for(i=0; i<rooms[prevroom].length; i++) {
                    rooms[prevroom][i].receiveLeftRoom(client.name,prevroom);
                }
            }
        }
    };

    var verifyPassword = function(name,password) {
        var sha1 = crypto.createHash('sha1');
        sha1.update(password);
        var hash = sha1.digest('hex');
        if(configuration.masters[name] !== undefined) {
            console.log(hash + " == "+configuration.masters[name]);
            return (hash == configuration.masters[name]);
        }
    }

    // **************************
    // Below this all are actions
    // **************************

    this.setName = function(client,newname) {
        var oldname;
        if(configuration.masters[newname] !== undefined) {
            if(arguments[2] === undefined) {
                throw errors.PasswordRequiredError("Password required",{username:newname});
            } else if(!verifyPassword(newname,arguments[2])) {
                throw errors.WrongPasswordError("Wrong password",{username:newname});
            }
        }

        if(clientsbyname[newname] !== undefined) {
            throw errors.NameTakenError("Username already taken",{newname:newname}); // TODO: change to username
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
        client.receiveWhois(who,buildWhois(who));
    };

    this.sendEntrywhois = function(client,who) {
        client.receiveEntrywhois(who,buildWhois(who));
    };

    this.sendRoomAutowhois = function(client) {
       whois = [];
       var room = rooms[nametoroom[client.name]];
       
       for(i=0; i<room.length; i++) {
           client.receiveAutowhois(room[i].name,buildWhois(room[i].name));
       }
    };

    this.sendAutowhois = function(client,who) {
       client.receiveAutowhois(who,whois.push(buildWhois(who)));
    };

    // other
    this.joinRoom = function(client,room) {
        //detect null rooms: don't allow users to null themselves
        if(room === null || room === "" || room === undefined) {
            throw errors.NullRoomError("Room is null.");
        } else {
            moveUserToRoom(client.name, room);
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
        var notfounds = [];
        for(var i=0; i<destinations.length; i++) {
            if(clientsbyname[destinations[i]] !== undefined) {
                clientsbyname[from].sentPrivateMessage(destinations[i],message);
                clientsbyname[destinations[i]].receivePrivateMessage(from,message);
            } else {
                notfounds.push(destinations[i]);
            }
        }
        if(notfounds.length > 0) {
            throw errors.UsersNotFoundError("Users not found.",{users:notfounds});
        }
    };

    // op/master only commands

    this.setBan = function(client, address, time) {
        if(levels[client.name] == constants.LEVEL_MASTER) {
            bans[address] = time;
        } else {
            throw errors.AccessDeniedToBanError("Client doesn't have permission to ban.",{address:address});
        }
//        time = getMaxBanTime(client,time);
/*        setInterval(function() {
            bans[address] -= 10;
            if(bans[address] <= 0) {
                delete bans[address];
            }
        }, 10000);
*/
    };
    this.unsetBan = function(client,address) {
        if(levels[client.name] == constants.LEVEL_MASTER) {
            delete bans[address];
        } else {
            throw errors.AccessDeniedToBanError("Client doesn't have permission to remove ban.",{address:address});
        }
    };
};

Server.prototype = EventEmitter;
Server.prototype.constructor = Server;

exports.createServer = function(bind_address, configuration, state) {
    return new Server(bind_address, configuration, state);
};

