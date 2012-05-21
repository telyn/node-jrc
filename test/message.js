var should = require('should');
var Message = require('../lib/message.js');
var constants = require('../lib/constants.js');

describe('Messages',function() {
    describe('That Are Really Necessary For Communication', function() {
        it('should correctly parse JRC_MESSAGE', function() {
            var message = new Message('EHello!');
            message.command.should.equal(constants.MESSAGE);
            message.hasSubcommand().should.be.false;
            message.params.length.should.equal(1);
            message.params[0].should.equal('Hello!');
        });
        it('should correctly parse JRC_PRIVATEMESSAGE', function() {
            var message = new Message('FHello!');
            message.command.should.equal(constants.PRIVATEMESSAGE);
            message.hasSubcommand().should.be.false;
            message.params.length.should.equal(1);
            message.params[0].should.equal('Hello!');

            message = new Message('FTest\tHello!');
            message.command.should.equal(constants.PRIVATEMESSAGE);
            message.hasSubcommand().should.be.false;
            message.params.length.should.equal(2);
            message.params[0].should.equal('Test');
            message.params[1].should.equal('Hello!');
        });
        it('should correctly parse JRC_NAME', function() {
        });

        it('should correctly parse JRC_JOIN');
        it('should correctly parse JRC_LEAVE');

        it('should correctly parse JRC_PASSWORD');
        it('should correctly parse JRC_SERVERAUTH');
        it('should correctly parse JRC_CHALLENGE');

        it('should correctly parse JRC_NUMERICINFO');
        it('should correctly parse JRC_GENERALINFO');
        it('should correctly parse JRC_INFO');

        it('should correctly parse JRC_USERINFO');
        it('should correctly parse JRC_ROOMINFO');
        it('should correctly parse JRC_ROOMUSERLIST');
    });
    describe('That Are Necessary For Controlling Users', function() {
        it('should correctly parse JRC_TIME');
        it('should correctly parse JRC_UN');
        
        it('should correctly parse JRC_SETINFO');
        it('should correctly parse JRC_OP');

        it('should correctly parse JRC_IGNORE');
        it('should correctly parse JRC_KICK');
        it('should correctly parse JRC_BAN');
        it('should correctly parse JRC_GAG');
        it('should correctly parse JRC_KEEPOUT');
        it('should correctly parse JRC_WAITLIST');

        it('should correctly parse JRC_REQUESTFAILED');
        it('should correctly parse JRC_NOTFOUND');
        it('should correctly parse JRC_ACCESSDENIED');
    });

    describe('That Are Necessary For Managing Rooms', function() {
        it('should correctly parse JRC_PERMROOM');
        it('should correctly parse JRC_SETINFO');
    });

    describe('That Are Totally Optional', function() {
        it('should correctly parse JRC_SERVERMESSAGE');

        it('should correctly parse JRC_SHUTDOWN');
        it('should correctly parse JRC_NOIGNORE');
        it('should correctly parse JRC_PASSWORD');
        it('should correctly parse JRC_MAIL');
        it('should correctly parse JRC_WHOIS');
    });

    describe('That I Don\'t Know The Purpose Of', function() {
        it('should correctly parse JRC_UNDO');
        it('should correctly parse JRC_LOG');
        it('should correctly parse JRC_SETVALUE');
        it('should correctly parse JRC_REFRESH');

        it('should correctly parse JRC_IP');
        it('should correctly parse JRC_PWD');
        it('should correctly parse JRC_NOEVENT');

        it('should correctly parse JRC_SERVERINFO');
        it('should correctly parse JRC_SPECIFICINFO');
    });
});
