var should = require('should');
var Message = require('../lib/message.js');
var constants = require('../lib/constants.js');

describe('Message',function() {
    describe('Client-to-Server Messages', function() {
        it('should understand JRC_MESSAGE', function() {
            var message = new Message('EHello!');
            message.command.should.equal(constants.MESSAGE);
            message.params.length.should.equal(1);
            message.params[0].should.equal('Hello!');
        });
        
    });
});
