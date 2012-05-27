var should = require('should');

var lib = process.env.COVERAGE ? '../lib-cov/' : '../lib/';
var Message = require(lib + 'message.js');
var constants = require(lib + 'constants.js');

describe('Server-bound Messages',function() {
    describe('That Are Really Necessary For Communication', function() {

        it('should parse incoming room-messages', function() {
            var message = new Message('EHello!');
            message.command.should.equal(constants.MESSAGE);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(1);
            message.params[0].should.equal('Hello!');
        });

        it('should parse incoming private messages', function() {
            var message = new Message('FHello!');
            message.command.should.equal(constants.PRIVATEMESSAGE);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(1);
            message.params[0].should.equal('Hello!');
        });

        it('should parse initial login requests', function() {
            var message = new Message('^AJRNet 1.1.636\tnornalbion');
            message.command.should.equal(constants.WHOIS);
            message.subcommand.should.equal(constants.NAME);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(2);
            message.params[0].should.equal("JRNet 1.1.636");
            message.params[1].should.equal("nornalbion");
        });

        it('should parse join-room requests', function() {
            var message = new Message('DCreatures');
            message.command.should.equal(constants.JOIN);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(1);
            message.params[0].should.equal("Creatures");
            
        });

        /*
         * I don't think quit-room requests exist, on reflection...
        it('should parse quit-room requests', function() {
            var message = new Message('CCreatures');
            message.command.should.equal(constants.JOIN);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            
            message.params[0].should.equal("Creatures");
        });*/

        //JRNet uses this as the trigger to complete its login. That is why it's essential.
        it('should parse new-style server authentication', function() {
            var message = new Message('~48462');
            message.command.should.equal(constants.SERVERCHALLENGE);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(1);
            message.params[0].should.equal("48462");
        });


        it('should parse requests for the user list', function() {
            var message = new Message('Ha');
            message.command.should.equal(constants.GENERALINFO);
            message.subcommand.should.equal(constants.USERINFO);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(0);
        });


        it('should parse requests for the room list', function() {
            var message = new Message('Hb');
            message.command.should.equal(constants.GENERALINFO);
            message.subcommand.should.equal(constants.ROOMINFO);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(0); 
        });


        it('should parse requests for the user list for a room',function() {
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

        it('should parse the autowhois JRNet sends for lag testing', function() {
            var message = new Message('^autowhois\tIc');

            message.command.should.equal(constants.WHOIS);
            message.subcommand.should.equal(constants.INFO);
            message.subsubcommand.should.equal(constants.ROOMUSERLIST);
            
            message.params.length.should.equal(2); 
            message.params[0].should.equal('autowhois');
            
        });

        it('should parse the autowhois JRNet sends for no discernable reason', function() {
            var message = new Message('^autowhois\tIanornalbion');

            message.command.should.equal(constants.WHOIS);
            message.subcommand.should.equal(constants.INFO);
            message.subsubcommand.should.equal(constants.USERINFO);
            
            message.params.length.should.equal(2); 
            message.params[0].should.equal('autowhois');
            message.params[1].should.equal('nornalbion');
        });

        /*it('should parse JRC_NUMERICINFO');
        it('should parse JRC_GENERALINFO');
        it('should parse JRC_INFO');

        it('should parse JRC_USERINFO');
        it('should parse JRC_ROOMINFO');
        it('should parse JRC_ROOMUSERLIST');*/
    });
    describe('That Are Necessary For Controlling Users', function() {
        it('should parse password entry', function() {
            var message = new Message('BaAWESOME PASSWORD INNIT');
            message.command.should.equal(constants.PASSWORD);
            message.subcommand.should.equal(constants.USERINFO);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(1);
            message.params[0].should.equal("AWESOME PASSWORD INNIT");
        });
        /*
        it('should parse JRC_TIME');
        it('should parse JRC_UN');
        
        it('should parse JRC_SETINFO');
        it('should parse JRC_OP');

        it('should parse JRC_IGNORE');
        it('should parse JRC_KICK');
        it('should parse JRC_BAN');
        it('should parse JRC_GAG');
        it('should parse JRC_KEEPOUT');
        it('should parse JRC_WAITLIST');

        it('should parse JRC_REQUESTFAILED');
        it('should parse JRC_NOTFOUND');
        it('should parse JRC_ACCESSDENIED');
        */
    });

    describe('That Are Necessary For Managing Rooms', function() {

        /*
        it('should parse JRC_PERMROOM');
        it('should parse JRC_SETINFO');
        */
    });

    describe('That Are Totally Optional', function() {
        it('should parse mail inbox requests', function() {
            var message = new Message("T");
            message.command.should.equal(constants.MAIL);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(0);
        });


        it('should parse mail count requests', function() {
            var message = new Message("GT");
            message.command.should.equal(constants.NUMERICINFO);
            message.subcommand.should.equal(constants.MAIL);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(0); 
        });


        it('should parse mail sending requests', function() {
            var message = new Message("TGameFreak\tHello!");
            message.command.should.equal(constants.MAIL);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(2);
            message.params[0].should.equal("GameFreak");
            message.params[1].should.equal("Hello!");
        })
        /*
        it('should parse JRC_SERVERMESSAGE');

        it('should parse JRC_SHUTDOWN');
        it('should parse JRC_NOIGNORE');
        it('should parse JRC_PASSWORD');
        
        it('should parse JRC_WHOIS');
        */
    });

    describe('That I Don\'t Know The Purpose Of', function() {
        // JRNet doesn't actually use these, but they exist!
        it('should parse requests for the user count', function() {
            var message = new Message("Ga");
            message.command.should.equal(constants.NUMERICINFO);
            message.subcommand.should.equal(constants.USERINFO);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(0);
        }); 


        it('should parse requests for the room count', function() {
            var message = new Message("Gb");
            message.command.should.equal(constants.NUMERICINFO);
            message.subcommand.should.equal(constants.ROOMINFO);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(0);
        });
        it('should parse requests for the user count for a room', function() {
            var message = new Message("GcCreatures");
            message.command.should.equal(constants.NUMERICINFO);
            message.subcommand.should.equal(constants.ROOMUSERLIST);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(1);
            message.params[0].should.equal("Creatures");
        });
        /*
        it('should parse JRC_UNDO');
        it('should parse JRC_LOG');
        it('should parse JRC_SETVALUE');
        it('should parse JRC_REFRESH');

        it('should parse JRC_IP');
        it('should parse JRC_PWD');
        it('should parse JRC_NOEVENT');

        it('should parse JRC_SERVERINFO');
        it('should parse JRC_SPECIFICINFO');
        */
    });
});


// ***********************************************************
// * Client-bound messages                                   *
// ***********************************************************

describe('Client-bound Messages', function() {
    describe('That Are Really Necessary For Communication', function() {
        it('should parse incoming room-messages', function() {
            var message = new Message('ENornAlbion\tHello!');
            message.command.should.equal(constants.MESSAGE);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(2);
            message.params[0].should.equal("NornAlbion");
            message.params[1].should.equal("Hello!");
        });


        it('should parse incoming private messages', function() {
            //from me to GameFreak
            var message = new Message('FNornAlbion\tGameFreak\tHello GameFreak!');
            message.command.should.equal(constants.PRIVATEMESSAGE);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(3);
            message.params[0].should.equal("NornAlbion");
            message.params[1].should.equal("GameFreak");
            message.params[2].should.equal("Hello GameFreak!");

            // From GameFreak to me!
            var message = new Message('FGameFreak\tHello NornAlbion!');
            message.command.should.equal(constants.PRIVATEMESSAGE);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(2);
            message.params[0].should.equal("GameFreak");
            message.params[1].should.equal("Hello NornAlbion!");
        });


        it('should parse incoming "(some person) joined (some room)" messages',function() {
            var message = new Message('DNornAlbion\tCreatures');
            message.command.should.equal(constants.JOIN);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(2);
            message.params[0].should.equal("NornAlbion");
            message.params[1].should.equal("Creatures");
        });


        it('should parse incoming "Someone left (some room) messages', function() {
           var message = new Message('CNornAlbion\tCreatures');
            message.command.should.equal(constants.LEAVE);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(2);
            message.params[0].should.equal("NornAlbion");
            message.params[1].should.equal("Creatures"); 
        });


        it('should parse incoming user list', function() {
            var message = new Message('H\taNornAlbion\tGameFreak');
            message.command.should.equal(constants.GENERALINFO);
            message.subcommand.should.equal(constants.USERINFO);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(2);
            message.params[0].should.equal("NornAlbion");
            message.params[1].should.equal("GameFreak");
        });


        it('should parse incoming room list', function() {
            var message = new Message('H\tbCreatures\tCreatures RPG');
            message.command.should.equal(constants.GENERALINFO);
            message.subcommand.should.equal(constants.ROOMINFO);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(2);
            message.params[0].should.equal("Creatures");
            message.params[1].should.equal("Creatures RPG");
        });


        it('should parse incoming users-in-room list', function() {
            var message = new Message('H\tcCreatures\tNornAlbion\tGameFreak');
            message.command.should.equal(constants.GENERALINFO);
            message.subcommand.should.equal(constants.ROOMUSERLIST);
            should.not.exist(message.subsubcommand);
            
            message.params.length.should.equal(3);
            message.params[0].should.equal("Creatures");
            message.params[1].should.equal("NornAlbion");
            message.params[2].should.equal("GameFreak");
        });


        it('should parse incoming whois', function() {
            //um, here's one I made earlier. This is known to work.
            var message =  new Message("^\tautowhois\tIanornalbion\tRoom\2Creatures\3IP\002127.0.0.1\3Access\2Ma\3Client\2null\3Idle\0023m20s\3Login\0025m32s\3");
            message.command.should.equal(constants.WHOIS);
            message.subcommand.should.equal(constants.INFO);
            message.subsubcommand.should.equal(constants.USERINFO);
            
            message.params.length.should.equal(3);
            message.params[0].should.equal("autowhois");
            message.params[1].should.equal("nornalbion");
            message.params[2].Room.should.equal("Creatures");
            message.params[2].IP.should.equal("127.0.0.1");
            message.params[2].Access.should.equal("Ma");
            message.params[2].Idle.should.equal("3m20s");
            message.params[2].Login.should.equal("5m32s");
        });
            
    });

    describe('That Are Necessary For User Control', function() {

    });

    describe('That Are Totally Optional', function() {
        it('should parse incoming mail', function() {
            // directed at one person
            var message = new Message("TGameFreak\tNornAlbion\tHello!");
            message.command.should.equal(constants.MAIL);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(3);
            message.params[0].should.equal("GameFreak");
            message.params[1].should.equal("NornAlbion");
            message.params[2].should.equal("Hello!");

            // directed at multiple
            var message = new Message("TGameFreak\tNornAlbion\tBlossom\tHello!");
            message.command.should.equal(constants.MAIL);
            should.not.exist(message.subcommand);
            should.not.exist(message.subsubcommand);

            message.params.length.should.equal(4);
            message.params[0].should.equal("GameFreak");
            message.params[1].should.equal("NornAlbion");
            message.params[2].should.equal("Blossom");
            message.params[3].should.equal("Hello!");
        });

    });

    describe('That I Don\'t Know The Purpose Of', function() {

    });

});