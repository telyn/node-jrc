var should = require('should');
var gently = new (require('gently'))();
var Message = require('../lib/message.js');
var constants = require('../lib/constants.js');
var Client = require('../lib/server/client.js');


describe('Server', function() {
    describe('Client Connection', function() {
        it('should create valid whois', function(done) {
            var streamstub = {
                remoteAddress: "",
                setKeepAlive: function() {},
                addListener: function() {},
                write: function(data) {
                    var message = new Message(data);
                    console.log(JSON.stringify(message));

                    done();
                }
            };

            var client = new Client({debug:false}, streamstub);
            client.receiveWhois("steve", {Offline: '5s'});
        });
    });
});

