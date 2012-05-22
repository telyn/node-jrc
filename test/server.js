var should = require('should');
var gently = new (require('gently'))();
var Message = require('../lib/message.js');
var constants = require('../lib/constants.js');
var Client = require('../lib/server/client.js');

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

    });
});

