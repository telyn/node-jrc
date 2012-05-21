var should = require('should');
var gently = new (require('gently'))();
var Message = require('../lib/message.js');
var constants = require('../lib/constants.js');
var Client = require('../lib/server/client.js');

var streamstub = {
    remoteAddress: "",
    setKeepAlive: function() {},
    addListener: function() {},
    write: function() { }
};

describe('Server', function() {
    describe('Client Connection', function() {
        it('should create a valid whois for a user.', function(done) {
            gently.expect(streamstub,'write', function(data) {

                var message = new Message(data);
                message.params[0].should.equal("whois");
                message.whois_data.should.have.property("steve");
                message.whois_data.steve.should.have.property("Online");
                message.whois_data.steve.Online.should.equal("5s");
                message.whois_data.steve.should.have.property("Level");
                message.whois_data.steve.Level.should.equal("Te");
                done();
            });

            var client = new Client({debug:false}, streamstub);
            client.receiveWhois("steve", {Online: '5s', Level: 'Te'});
        });

        it('should create a valid room list.', function(done) {
            gently.expect(streamstub, 'write', function(data) {
                var message = new Message(data);
                message.command.should.equal(constants.GENERALINFO);
                message.hasSubcommand().should.be.true;
                message.subcommand.should.equal(constants.ROOMINFO);
                
                message.params.length.should.equal(3);
                message.params[0].should.equal("");
                message.params[1].should.equal("btest");
                message.params[2].should.equal("test 2");
                done();
            });

            var client = new Client({debug:false}, streamstub);
            client.receiveRoomList(["test","test 2"]);

        });

    });
});

