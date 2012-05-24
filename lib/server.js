var net = require("net");
var crypto = require("crypto");
var EventEmitter = require("events").EventEmitter;
var Client = require("./server/client.js");
var errors = require("./errors.js");
var constants = require("./constants.js");
var util = require('util');


var Server = function(bind_address,config,state) {
    
    this.address = bind_address;
    this.port = 0;
    this.debug = config.debug || false;
    this.silent = config.silent || false;
    
    var clients = [];
    var gags = {};
    var bans = state.bans || {};
    var keepouts = {};
    var rooms = { 'Creatures': [], 'Creatures RPG': [] };
    var nametoroom = {};
    var clientsbyname = {};
    var levels = {};
    var configuration = config;

    if(this.debug && !this.silent) {
        console.log(JSON.stringify(bans));
    }

    if(configuration.masters === undefined) {
        configuration.masters = {};
    }
    var mcount = 0;
    for(var m in configuration.masters) {
        levels[m] = constants.LEVEL_MASTER;
        mcount++;
    }


    if(!this.silent) {
        console.log(mcount + " masters.");
    }


    var self = this;

    var log = function(text,debug) {
        if((debug === undefined || this.debug) && !this.silent) {
            console.log(text);
        } else if(this.debug && !this.silent) {
            console.log(text);
        }
    }

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
       log("Listening on "+self.address+":"+self.port);
    };

    this.listen = function(port) {
       this.port = port;
       jrcListener.listen(port,this.address,this.boundHandler);
    };

    this.addClient = function(client) {
        clients.push(client);
    };


    this.removeClient = function(client) {
        
        var whois = buildWhois(client.name);
        whois.Offline = "1s";
        clients.splice(clients.indexOf(client), 1);


        for(var i=0; i<clients.length; i++) {
            clients[i].receiveLeftRoom(client.name, nametoroom[client.name]);
            clients[i].receiveAutowhois(client.name, whois);
        }
        delete nametoroom[client.name];
        delete clientsbyname[client.name];

        for(var x in rooms) {
            var room = rooms[x];
            var pos = room.indexOf(client);
            if(pos != -1) {
                room.splice(pos,1);
            }
        }
        log("Removing client "+client.address);
    };

    jrcListener.on('error',function(e) {
        if( e.code == 'EADDRINUSE') {
            log('Address in use, retrying.');
            setTimeout(function() {
                jrcListener.listen(this.port,this.address,this.boundHandler);
            },1000);
        }
    });

    // optional second argument includeName

    var buildWhois = function(name) {
        var client = clientsbyname[name];
        if(client === null || client === undefined) {
            throw new errors.UserNotFoundError("User " + name + " not found", {user:name});
        } else {
            var whois = {
                Room: nametoroom[name],
                IP:  client.ipAddress, 
                Access: levels[name] || constants.LEVEL_USER,
                Client: client.client,
                Idle: '3m20s', // TODO: use data that I didn't make up
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
            throw new errors.UserNotFoundError("User not found",{user:name});
        }

        if(rooms[room] === undefined && room !== "") {
            throw new errors.RoomNotFoundError("Room not found",{room:room});
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
            log(hash + " == "+configuration.masters[name]);
            return (hash == configuration.masters[name]);
        }
    };

    
    this.accessLevelAboveOrEqual = function(user_level, level) {
        if(level != constants.LEVEL_USER && level != constants.LEVEL_TEMPOP && level != constants.LEVEL_OPERATOR && level != constants.LEVEL_MASTER) {
            throw new errors.InvalidLevelError("Level " + level + " is not valid!")
        }
        if(user_level != constants.LEVEL_USER && user_level != constants.LEVEL_TEMPOP && user_level != constants.LEVEL_OPERATOR && user_level != constants.LEVEL_MASTER) {
            throw new errors.InvalidLevelError("Level " + user_level + " is not valid!")
        }

        // level should cascade down.
        // e.g. if user_level = operator and level = tempop
        // first case is false, doesn't run.
        // second case is true, user_level != tempop, nothing happens
        // cascades to third case
        // user_level == operator => return true
        switch(level) {
            case constants.LEVEL_USER:
                return true;
            case constants.LEVEL_TEMPOP:
                if(user_level == constants.LEVEL_TEMPOP) {
                    return true;
                }
            case constants.LEVEL_OPERATOR:
                if(user_level == constants.LEVEL_OPERATOR) {
                    return true;
                }
            case constants.LEVEL_MASTER:
                if(user_level == constants.LEVEL_MASTER) {
                    return true;
                }
            default:
                return false;
        }
    };

    
    this.accessLevelBelowOrEqual = function(user_level, level) {
        if(level != constants.LEVEL_USER && level != constants.LEVEL_TEMPOP && level != constants.LEVEL_OPERATOR && level != constants.LEVEL_MASTER) {
            throw new errors.InvalidLevelError("Level " + level + " is not valid!")
        }
        if(user_level != constants.LEVEL_USER && user_level != constants.LEVEL_TEMPOP && user_level != constants.LEVEL_OPERATOR && user_level != constants.LEVEL_MASTER) {
            throw new errors.InvalidLevelError("Level " + user_level + " is not valid!")
        }

        // level should cascade down.
        
        switch(level) {
            case constants.LEVEL_MASTER:
                return true;
            case constants.LEVEL_OPERATOR:
                if(user_level == constants.LEVEL_OPERATOR) {
                    return true;
                }
            case constants.LEVEL_TEMPOP:
                if(user_level == constants.LEVEL_TEMPOP) {
                    return true;
                }
            case constants.LEVEL_USER:
                if(user_level == constants.LEVEL_USER) {
                    return true;
                }
            default:
                return false;
        }
    }

    var requireAccessLevel = function(name, level, success) {
        var user_level = levels[name] || constants.LEVEL_USER;
        if(accessLevelAboveOrEqual(user_level,level)) {
            success(user_level);
        }
    }

    // **************************
    // Below this all are actions
    // **************************

    this.setName = function(client,newname) {
        var oldname;
        
        if(configuration.masters[newname] !== undefined) {
            if(arguments[2] === undefined) {
                throw new errors.PasswordRequiredError("Password required",{username:newname});
            } else if(!verifyPassword(newname,arguments[2])) {
                throw new errors.WrongPasswordError("Wrong password",{username:newname});
            }
        }

        if(clientsbyname[newname] !== undefined) {
            throw new errors.NameTakenError("Username already taken",{newname:newname}); // TODO: change to username
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
        try {
            client.receiveEntrywhois(who,buildWhois(who));
        } catch(e) {
            return; //TODO throw an error
        }
    };

    this.sendRoomAutowhois = function(client) {
       whois = [];
       var room = rooms[nametoroom[client.name]];
       
       for(i=0; i<room.length; i++) {
           try {
               client.receiveAutowhois(room[i].name,buildWhois(room[i].name));
           } catch(e) {
               continue;
           }
       }
    };

    this.sendAutowhois = function(client,who) {
        try {
           client.receiveAutowhois(who,whois.push(buildWhois(who)));
        } catch(e) {
            return;
        }
    };

    // other
    this.joinRoom = function(client,room) {
        //detect null rooms: don't allow users to null themselves
        if(room === null || room === "" || room === undefined) {
            throw new errors.NullRoomError("Room is null.");
        } else {
            moveUserToRoom(client.name, room);
        }
    };
    
    this.sendMessage = function(from,room,message) {
        if(room === null || room === "") {
            clientsbyname[from].receiveRegularMessage(from,message);
            throw new NullRoomError("Room is null.");
        } else {
            if(nametoroom[from] != room && accessLevelBelowOrEqual(constants.LEVEL_TEMPOP)) {
                throw new NotInRoomException(from + " is not in " + room, {username: from, room: room});
            }
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
            throw new errors.UsersNotFoundError("Users not found.",{users:notfounds});
        }
    };

    // op/master only commands

    this.setBan = function(client, address, time) {
        if(levels[client.name] == constants.LEVEL_MASTER) {
            bans[address] = time;
        } else {
            throw new errors.AccessDeniedToBanError("Client doesn't have permission to ban.",{address:address});
        }
        time = getMaxBanTime(client,time);
        var id = setInterval(function() {
            if(bans[address] === undefined) {
                clearInterval(id);
                return;
            }
            if(bans[address] != -11) {
                bans[address] -= 10;
                if(bans[address] <= 0) {
                    delete bans[address];
                }
            }
        }, 10000);

    };

    
    this.unsetBan = function(client,address) {
        if(levels[client.name] == constants.LEVEL_MASTER) {
            delete bans[address];
        } else {
            throw new errors.AccessDeniedToBanError("Client doesn't have permission to remove ban.",{address:address});
        }
    };
};

util.inherits(Server,EventEmitter);

module.exports.createServer = function(bind_address, configuration, state) {
    return new Server(bind_address, configuration, state);
};

