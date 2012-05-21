var should = require('should');
var Message = require('../lib/message.js');

describe('Message',function() {
    describe('Client-to-Server Messages', function() {
        it('should understand JRC_NORMAL', function() {
            var message = new Message('EHello!');
            message.command.should.equal('E');
            message.params.length.should.equal(1);
            message.params[0].should.equal('Hello!');
        });
    });
});
