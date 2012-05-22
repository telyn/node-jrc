var should = require('should');
var Message = require('../lib/message.js');
var constants = require('../lib/constants.js');

describe('Server-bound Messages',function() {
    describe('That Are Really Necessary For Communication', function() {

        it('should correctly parse incoming room-messages', function() {
            var message = new Message('EHello!');
            message.command.should.equal(constants.MESSAGE);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(1);
            message.params[0].should.equal('Hello!');
        });

        it('should correctly parse incoming private messages', function() {
            var message = new Message('FHello!');
            message.command.should.equal(constants.PRIVATEMESSAGE);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(1);
            message.params[0].should.equal('Hello!');
        });

        it('should correctly parse initial login requests', function() {
            var message = new Message('^AJRNet 1.1.636\tnornalbion');
            message.command.should.equal(constants.WHOIS);
            message.subcommand.should.equal(constants.NAME);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(2);
            message.params[0].should.equal("JRNet 1.1.636");
            message.params[1].should.equal("nornalbion");
        });

        it('should correctly parse join-room requests', function() {
            var message = new Message('DCreatures');
            message.command.should.equal(constants.JOIN);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(1);
            message.params[0].should.equal("Creatures");
            
        });

        /*
         * I don't think quit-room requests exist, on reflection...
        it('should correctly parse quit-room requests', function() {
            var message = new Message('CCreatures');
            message.command.should.equal(constants.JOIN);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            
            message.params[0].should.equal("Creatures");
        });*/

        //JRNet uses this as the trigger to complete its login. That is why it's essential.
        it('should correctly parse new-style server authentication', function() {
            var message = new Message('~48462');
            message.command.should.equal(constants.SERVERCHALLENGE);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(1);
            message.params[0].should.equal("48462");
        });


        it('should correctly parse requests for the user list', function() {
            var message = new Message('Ha');
            message.command.should.equal(constants.GENERALINFO);
            message.subcommand.should.equal(constants.USERINFO);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(0);
        });


        it('should correctly parse requests for the room list', function() {
            var message = new Message('Hb');
            message.command.should.equal(constants.GENERALINFO);
            message.subcommand.should.equal(constants.ROOMINFO);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(0); 
        });


        it('should correctly parse requests for the user list for a room',function() {
            //menu option in JRNet
            var message = new Message('HcCreatures');

            message.command.should.equal(constants.GENERALINFO);
            message.subcommand.should.equal(constants.ROOMUSERLIST);

            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(1);
            message.params[0].should.equal("Creatures");

            //JRNet also seems to send this version on connect.
            var message = new Message('Hc\tCreatures');

            message.command.should.equal(constants.GENERALINFO);
            message.subcommand.should.equal(constants.ROOMUSERLIST);
            
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(2);
        });

        it('should correctly parse the autowhois JRNet sends for lag testing', function() {
            var message = new Message('^autowhois\tIc');

            message.command.should.equal(constants.WHOIS);
            message.subcommand.should.equal(constants.INFO);
            message.subsubcommand.should.equal(constants.ROOMUSERLIST);
            

            
            message.params.length.should.equal(2); 
            message.params[0].should.equal('autowhois');
            
        });

        it('should correctly parse the autowhois JRNet sends for no discernable reason', function() {
            var message = new Message('^autowhois\tIanornalbion');

            message.command.should.equal(constants.WHOIS);
            message.subcommand.should.equal(constants.INFO);
            message.subsubcommand.should.equal(constants.USERINFO);
            
            message.params.length.should.equal(2); 
            message.params[0].should.equal('autowhois');
            message.params[1].should.equal('nornalbion');
        });

        /*it('should correctly parse JRC_NUMERICINFO');
        it('should correctly parse JRC_GENERALINFO');
        it('should correctly parse JRC_INFO');

        it('should correctly parse JRC_USERINFO');
        it('should correctly parse JRC_ROOMINFO');
        it('should correctly parse JRC_ROOMUSERLIST');*/
    });
    describe('That Are Necessary For Controlling Users', function() {
        it('should correctly parse password entry', function() {
            var message = new Message('BaAWESOME PASSWORD INNIT');
            message.command.should.equal(constants.PASSWORD);
            message.subcommand.should.equal(constants.USERINFO);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(1);
            message.params[0].should.equal("AWESOME PASSWORD INNIT");
        });
        /*
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
        */
    });

    describe('That Are Necessary For Managing Rooms', function() {

        /*
        it('should correctly parse JRC_PERMROOM');
        it('should correctly parse JRC_SETINFO');
    });

    describe('That Are Totally Optional', function() {
        it('should correctly parse JRC_SERVERMESSAGE');

        it('should correctly parse JRC_SHUTDOWN');
        it('should correctly parse JRC_NOIGNORE');
        it('should correctly parse JRC_PASSWORD');
        it('should correctly parse JRC_MAIL');
        it('should correctly parse JRC_WHOIS');*/
    });

    describe('That I Don\'t Know The Purpose Of', function() {
        // JRNet doesn't actually use these, but they exist!
        it('should correctly parse requests for the user count'); // JRC_NUMERICINFO
        it('should correctly parse requests for the room count');
        it('should correctly parse requests for the user count for a room');
        /*
        it('should correctly parse JRC_UNDO');
        it('should correctly parse JRC_LOG');
        it('should correctly parse JRC_SETVALUE');
        it('should correctly parse JRC_REFRESH');

        it('should correctly parse JRC_IP');
        it('should correctly parse JRC_PWD');
        it('should correctly parse JRC_NOEVENT');

        it('should correctly parse JRC_SERVERINFO');
        it('should correctly parse JRC_SPECIFICINFO');
        */
    });
});

describe('Client-bound Messages', function() {
    describe('That Are Really Necessary For Communication', function() {

    });

});