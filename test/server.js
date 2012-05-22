var should = require('should');
var gently = new (require('gently'))();
var Message = require('../lib/message.js');
var constants = require('../lib/constants.js');
var Client = require('../lib/server/client.js');
var errors = require('../lib/errors.js');

var streamstub;

var chomp = function(string) {
    return string.replace(/(\n|\r)+$/, '');
};

describe('Server', function() {
    describe('Client Connection', function() {
        beforeEach(function() {
            streamstub = {
                remoteAddress: "",
                setKeepAlive: function() {},
                addListener: function() {},
                write: function() { }
            };
        });


        it('should send a valid (forced) leave message', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "wCSome reason!";

                data.should.equal(expected);
                done();
            });

            var client = new Client({debug:false}, streamstub);
            client.leave('Some reason!');
        });


        it('should send a valid other-user-left message', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "CPerson\tRoom";

                data.should.equal(expected);
                done();
            });

            var client = new Client({debug:false}, streamstub);
            client.receiveLeftRoom('Person','Room');
        });


        it('should send a valid challenge message', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "w~46532";

                data.should.equal(expected);
                done();
            });

            var client = new Client({debug:false}, streamstub);
            client.receiveChallenge(46532);
        });


        it('should send valid server user count', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "G\ta45";

                data.should.equal(expected);
                done();
            });

            var client = new Client({debug:false}, streamstub);
            client.receiveServerUserCount(45);
        });


        it('should send valid server user list', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "H\taNornAlbion\tGameFreak";

                data.should.equal(expected);
                done();
            });

            var client = new Client({debug:false}, streamstub);
            client.receiveServerUserList(['NornAlbion', 'GameFreak'])
        });


        it('should send a valid room list.', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                data = chomp(data);
                var expected= "H\tbtest\ttest 2";

                data.should.equal(expected);
                done();
            });

            var client = new Client({debug:false}, streamstub);
            client.receiveRoomList(["test","test 2"]);

        });


        it('should send a valid whois for a user.', function(done) {
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected= "^\twhois\tIasteve\tOnline\0025s\3Level\2Te\3";

                data.should.equal(expected);
                done();
            });

            var client = new Client({debug:false}, streamstub);
            client.receiveWhois("steve", {Online: '5s', Level: 'Te'});
        });


        it('shouldn\'t do anything on a NullRoomError', function() {
            var wroteSomething = false;
            var error = errors.NullRoomError();
            streamstub.write = function(data) {
                wroteSomething = true;
                
            };

            var client = new Client({debug:false}, streamstub);
            client.handleError(error);
            wroteSomething.should.be.false;
        });


        it('should handle a RoomNotFoundError', function(done) {
            var error = errors.RoomNotFoundError();
            error.room = "Creatures";
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xyb"+error.room;
                

                data.should.equal(expected);
                done();
            });
            var client = new Client({debug:false}, streamstub);
            client.handleError(error);

        });


        it('should handle a UserNotFoundError', function(done) {
            var error = errors.UserNotFoundError();
            error.user = "NornAlbion";
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xya"+error.user;
                

                data.should.equal(expected);
                done();
            });
            var client = new Client({debug:false}, streamstub);
            client.handleError(error);
        });


        it('should handle a UsersNotFoundError', function(done) {
            var error = errors.UsersNotFoundError();
            error.users = ["NornAlbion","GameFreak"];
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xya"+error.users.join("\t");
                

                data.should.equal(expected);
                done();
            });
            var client = new Client({debug:false}, streamstub);
            client.handleError(error);
        });


        it('should handle a NameTakenError', function(done) {
            var error = errors.NameTakenError();
            error.nick = "NornAlbion";
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
            var client = new Client({debug:false}, streamstub);
            client.handleError(error);
        });


        it('should handle a PasswordRequiredError', function(done) {
            var error = errors.PasswordRequiredError();
            error.username = "NornAlbion";

            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "wB"+error.username;
                

                data.should.equal(expected);
                done();
            });
            var client = new Client({debug:false}, streamstub);
            client.handleError(error);
        });


        it('should handle a WrongPasswordError', function(done) {
            var error = errors.WrongPasswordError();
            error.username = "NornAlbion";
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xza"+error.username;
                

                data.should.equal(expected);
            });

            var client = new Client({debug:false}, streamstub);

            gently.expect(client, 'leave', function(reason) {
                done();
            });

            
            client.handleError(error);
        });


        it('should handle a AccessDeniedToBanError', function(done) {
            var error = errors.AccessDeniedToBanError();
            error.address = "10.0.0.1";
            
            gently.expect(streamstub,'write', function(data) {
                data = chomp(data);
                var expected = "xzL"+error.address;
                

                data.should.equal(expected);
                done();
            });
            var client = new Client({debug:false}, streamstub);
            client.handleError(error);
        });

    });
});

