var should = require('should');
var gently = new (require('gently'))();

var lib = process.env.COVERAGE ? '../lib-cov/' : '../lib/';
var Message = require(lib + 'message.js');
var constants = require(lib + 'constants.js');
var Client = require(lib + 'server/client.js');
var jrc = require(lib + 'server');
var errors = require(lib + 'errors.js');

var chomp = function(string) {
    return string.replace(/(\n|\r)+$/, '');
};

var streamstub;
var client;
var server;

describe('Client Connection', function() {
	describe('Sending messages', function() {
        beforeEach(function() {
            streamstub = {
                remoteAddress: "",
                setKeepAlive: function() {},
                addListener: function() {},
                write: function() { }
            };
            client = new Client({debug:false}, streamstub);
        });


        it('should send a valid (forced) leave message', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "wCSome reason!";

                data.should.equal(expected);
                done();
            });

            
            client.leave('Some reason!');
        });


        it('should send a valid other-user-left message', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "CPerson\tRoom";

                data.should.equal(expected);
                done();
            });

            
            client.receiveLeftRoom('Person','Room');
        });


        it('should send a valid challenge message', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "w~46532";

                data.should.equal(expected);
                done();
            });

            
            client.receiveChallenge(46532);
        });


        it('should send valid server user count', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "G\ta45";

                data.should.equal(expected);
                done();
            });

            
            client.receiveServerUserCount(45);
        });


        it('should send valid server user list', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "H\taNornAlbion\tGameFreak";

                data.should.equal(expected);
                done();
            });

            
            client.receiveServerUserList(['NornAlbion', 'GameFreak']);
        });


        it('should send a valid room list.', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "H\tbtest\ttest 2";

                data.should.equal(expected);
                done();
            });

            
            client.receiveRoomList(["test","test 2"]);

        });


        it('should send a valid whois for a user.', function(done) {
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected= "^\twhois\tIasteve\tOnline\0025s\3Level\2Te\3";

                data.should.equal(expected);
                done();
            });

            
            client.receiveWhois("steve", {Online: '5s', Level: 'Te'});
        });

        it('should send a valid inbox count', function(done) {
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected= "GT1";

                data.should.equal(expected);
                done();
            });
            

            client.receiveInboxCount(1);
        });

        it('should send a valid inbox message', function(done) {
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = 'TGameFreak\tNornAlbion\tHello!';
                data.should.equal(expected);

                gently.expect(streamstub,'write', function(data) {
                    data = chomp(data);
                    var expected = 'TGameFreak\tNornAlbion\tMarcoPolo\tHello!';
                    data.should.equal(expected);
                    done();
                });

                client.receiveMail('GameFreak',['NornAlbion','MarcoPolo'], 'Hello!');
                
            });

            client.receiveMail('GameFreak',['NornAlbion'], 'Hello!');
        });

	});

    describe('Receiving messages', function() {
        beforeEach(function() {
            var cfg = {
                    debug:false,
                    silent:true
                };
            server = jrc.createServer("127.0.0.1",cfg,{});
            streamstub = {
                remoteAddress: "",
                setKeepAlive: function() {},
                addListener: function() {},
                write: function() { },
                close: function() { }
            };
            client = new Client(server,streamstub);
            client.handleErrors = false;
            server.addClient(client);
        });

        afterEach(function() {
            gently.verify();
        });

        it('should handle incoming login requests', function(done) {

            // because gently hijacks calls, server.setName is never actually called
            // so no PasswordRequiredError is generated for NornAlbion.
            gently.expect(server, 'setName',1, function(c, name) {
                //this.setName(c,name);

                c.should.equal(client);
                name.should.equal('NornAlbion');
            });
            gently.expect(client, 'receiveChallenge',1, function(challenge) {
                challenge.should.be.within(1, 70000);
                done();
            });
            client.dataHandler('^JRNet 1.1.636\tANornAlbion'); 

        });

        it('should handle incoming successful challenge responses', function() {
            var sentsomething = false;
            client.send = function() {
                console.log(JSON.stringify(arguments));
                sentsomething = true;
            };
            client.challenge = 53046;
            client.dataHandler('~55984');
            sentsomething.should.be.false;
        });

        it('should handle incoming unsuccessful challenge responses', function(done) {
            client.name = 'NornAlbion';
            client.room = "Creatures";
            
            gently.expect(client,'leave');
            gently.expect(streamstub, 'close');
            gently.expect(server, 'removeClient', function(c) {
                c.name.should.equal("NornAlbion");
                done();
            });

            client.challenge = 53046;
            client.dataHandler('~55985');
        });


        it('should handle incoming normal messages', function(done) {
            client.name = "NornAlbion";
            client.room = "Creatures";
            gently.expect(server,'sendMessage', function(name, room, message) {
                name.should.equal("NornAlbion");
                room.should.equal("Creatures");
                message.should.equal("Hello!");
                done();
            });
            client.dataHandler("EHello!");

        });


        it('should handle incoming private messages', function(done) {
            client.name = "NornAlbion";
            gently.expect(server,'sendPrivateMessage', function(name, recipients, message) {
                name.should.equal("NornAlbion");
                recipients[0].should.equal("GameFreak");
                message.should.equal("Hello!");

                gently.expect(server,'sendPrivateMessage', function(name, recipients, message) {
                    name.should.equal("NornAlbion");
                    recipients[0].should.equal("GameFreak");
                    recipients[1].should.equal("WolfKazumaru");
                    message.should.equal("Hello!");
                    done();
                });
                client.dataHandler("FGameFreak\tWolfKazumaru\tHello!");
            });

            client.dataHandler("FGameFreak\tHello!");
        });
        
        it('should handle incoming room join requests', function(done) {
            client.name = "NornAlbion";
            gently.expect(server,'joinRoom', function(name, room) {
                    name.should.equal("NornAlbion");
                    room.should.equal("Creatures");
                    done();
                });
                client.dataHandler("DCreatures");
        });

        it('should handle incoming userlist requests', function(done) {
            client.name = 'NornAlbion';
            gently.expect(server, 'sendServerUserList', function(c) {
                c.should.equal(client.name);
                done();
            });
            client.dataHandler('Ha');
        });

        it('should handle incoming room list requests', function(done) {
            client.name = 'NornAlbion';
            gently.expect(server, 'sendRoomList', function(c) {
                c.should.equal("NornAlbion");
                done();
            });
            client.dataHandler('Hb');

        });

        it('should handle incoming room userlist requests', function(done) {
            client.name = 'NornAlbion';
            gently.expect(server, 'sendRoomUserList', function(c, room) {
                c.should.equal("NornAlbion");
                room.should.equal("Creatures");
                done();
            });
            client.dataHandler('HcCreatures');
        });

        it('should handle incoming user count requests', function(done) {
            client.name = 'NornAlbion';
            gently.expect(server, 'sendServerUserCount', function(c) {
                c.should.equal("NornAlbion");
                
                done();
            });
            client.dataHandler('Ga');
        });

        it('should handle incoming room count requests', function(done) {
            client.name = 'NornAlbion';
            gently.expect(server, 'sendRoomCount', function(c, room) {
                c.should.equal("NornAlbion");
                
                done();
            });
            client.dataHandler('Gb');
        });

        it('should handle incoming room user count requests', function(done) {
            client.name = 'NornAlbion';
            gently.expect(server, 'sendRoomUserCount', function(c, room) {
                c.should.equal("NornAlbion");
                room.should.equal("Creatures");
                done();
            });
            client.dataHandler('GcCreatures');
        });

        it('should handle incoming mail count requests', function(done) {
            client.name = 'NornAlbion';
            gently.expect(server, 'sendInboxCount', function(c) {
                c.should.equal("NornAlbion");
                
                done();
            });
            client.dataHandler('GT');
        });

        it('should handle incoming mail requests', function(done) {
            client.name = 'NornAlbion';
            gently.expect(server, 'sendInbox', function(c) {
                c.should.equal('NornAlbion');

                done();
            });
            client.dataHandler('T');
        });

        it('should handle incoming send mail requests', function(done) {
            client.name = 'NornAlbion';
            gently.expect(server, 'sendMailTo', function(from,to,message) {
                from.should.equal(client.name);
                to.length.should.equal(1);
                to[0].should.equal('GameFreak');
                message.should.equal('Hello!');
                done();
            });
            client.dataHandler('TGameFreak\tHello!');
        });


    });

	describe('Error handling', function() {
		beforeEach(function() {
            streamstub = {
                remoteAddress: "",
                setKeepAlive: function() {},
                addListener: function() {},
                write: function() { }
            };
            client = new Client({debug:false}, streamstub);
        });

        it('shouldn\'t do anything on a NullRoomError', function() {
            var wroteSomething = false;
           
            var error = new errors.NullRoomError();
            streamstub.write = function(data) {
                wroteSomething = true;
                
            };

            
            client.handleError(error);
            wroteSomething.should.be.false;
        });


        it('should handle a RoomNotFoundError', function(done) {
            var error = new errors.RoomNotFoundError("Room not found", {room: "Creatures"});
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xyb"+error.room;
                

                data.should.equal(expected);
                done();
            });
            
            client.handleError(error);

        });


        it('should handle a UserNotFoundError', function(done) {
            var error = new errors.UserNotFoundError("User not found", {user: "NornAlbion"});
            error.user = "NornAlbion";
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xya"+error.user;
                

                data.should.equal(expected);
                done();
            });
            
            client.handleError(error);
        });


        it('should handle a UsersNotFoundError', function(done) {
            var error = new errors.UsersNotFoundError("Users not found", {users: ["NornAlbion","GameFreak"]});
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xya"+error.users.join("\t");
                

                data.should.equal(expected);
                done();
            });
            
            client.handleError(error);
        });


        it('should handle a NameTakenError', function(done) {
            var error = new errors.NameTakenError("Name already in use", {newname: "NornAlbion"});
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "wCName in use.";
                // this is actually a SERVERMESSAGE LEAVE
                // rather than an actual
                // REQUESTFAILED ACCESSDENIED NAME
                // or anything similar.
                // Because that's what JRC did.
                

                data.should.equal(expected);
                done();
            });
            
            client.handleError(error);
        });


        it('should handle a PasswordRequiredError', function(done) {
            var error = new errors.PasswordRequiredError("Password required", {username: "NornAlbion"});
            

            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "wB"+error.username;
                

                data.should.equal(expected);
                done();
            });
            
            client.handleError(error);
        });


        it('should handle a WrongPasswordError', function(done) {
            var error = new errors.WrongPasswordError("That is the wrong password!", {username: "NornAlbion"});
            
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xza"+error.username;
                

                data.should.equal(expected);
            });

            

            gently.expect(client, 'leave', function(reason) {
                done();
            });

            
            client.handleError(error);
        });


        it('should handle an AccessDeniedToBanError', function(done) {
            var error = new errors.AccessDeniedToBanError("You don't have permission to ban.", {address: "10.0.0.1"});
            
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xzL"+error.address;
                

                data.should.equal(expected);
                done();
            });
            
            client.handleError(error);
        });

        it('should handle a NoMailError', function(done) {
            var error = new errors.NoMailError("No mail found for you!");

            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xyT";

                data.should.equal(expected);
                done();
            });
            client.handleError(error);
        });     

    });
});