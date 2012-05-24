var should = require('should');
var gently = new (require('gently'))();
var Message = require('../lib/message.js');
var constants = require('../lib/constants.js');
var Client = require('../lib/server/client.js');
var errors = require('../lib/errors.js');
var jrc = require('../');

var streamstub;
var server;
var client;

var chomp = function(string) {
    return string.replace(/(\n|\r)+$/, '');
};

describe('Server', function() {
    describe('Internals', function() {
        describe('#accessLevelAboveOrEqual', function() {
            beforeEach(function() {
                server = jrc.createServer("",{silent:true},{})

            });

            it('should always return true when target level is User', function() {
                server.accessLevelAboveOrEqual(constants.LEVEL_USER, constants.LEVEL_USER).should.be.true;
                server.accessLevelAboveOrEqual(constants.LEVEL_TEMPOP, constants.LEVEL_USER).should.be.true;
                server.accessLevelAboveOrEqual(constants.LEVEL_OPERATOR, constants.LEVEL_USER).should.be.true;
                server.accessLevelAboveOrEqual(constants.LEVEL_MASTER, constants.LEVEL_USER).should.be.true;
            });

            it('should work when target level is Tempop', function() {
                server.accessLevelAboveOrEqual(constants.LEVEL_USER, constants.LEVEL_TEMPOP).should.be.false;
                server.accessLevelAboveOrEqual(constants.LEVEL_TEMPOP, constants.LEVEL_TEMPOP).should.be.true;
                server.accessLevelAboveOrEqual(constants.LEVEL_OPERATOR, constants.LEVEL_TEMPOP).should.be.true;
                server.accessLevelAboveOrEqual(constants.LEVEL_MASTER, constants.LEVEL_TEMPOP).should.be.true;
            });

            it('should work when target level is Operator', function() {
                server.accessLevelAboveOrEqual(constants.LEVEL_USER, constants.LEVEL_OPERATOR).should.be.false;
                server.accessLevelAboveOrEqual(constants.LEVEL_TEMPOP, constants.LEVEL_OPERATOR).should.be.false;
                server.accessLevelAboveOrEqual(constants.LEVEL_OPERATOR, constants.LEVEL_OPERATOR).should.be.true;
                server.accessLevelAboveOrEqual(constants.LEVEL_MASTER, constants.LEVEL_OPERATOR).should.be.true;
            });

            it('should work when target level is Operator', function() {
                server.accessLevelAboveOrEqual(constants.LEVEL_USER, constants.LEVEL_OPERATOR).should.be.false;
                server.accessLevelAboveOrEqual(constants.LEVEL_TEMPOP, constants.LEVEL_OPERATOR).should.be.false;
                server.accessLevelAboveOrEqual(constants.LEVEL_OPERATOR, constants.LEVEL_OPERATOR).should.be.true;
                server.accessLevelAboveOrEqual(constants.LEVEL_MASTER, constants.LEVEL_OPERATOR).should.be.true;
            });

            it('should error when given invalid levels', function() {
                var count = 0;
                var test = function(user_level, level) {
                    var threw = false;
                    try {
                        server.accessLevelAboveOrEqual(user_level,level)
                    } catch(e) {
                        e.should.instanceof(errors.InvalidLevelError);
                        threw = true;
                        count++;
                    }
                    threw.should.be.true;
                };
                test("Mamihlapinatapai",constants.LEVEL_USER);
                test("Mamihlapinatapai",constants.LEVEL_TEMPOP);
                test("Mamihlapinatapai",constants.LEVEL_OPERATOR);
                test("Mamihlapinatapai",constants.LEVEL_MASTER);
                test(constants.LEVEL_USER,"Mamihlapinatapai");
                test(constants.LEVEL_TEMPOP,"Mamihlapinatapai");
                test(constants.LEVEL_OPERATOR,"Mamihlapinatapai");
                test(constants.LEVEL_MASTER,"Mamihlapinatapai");
                test("Mamihlapinatapai","Mamihlapinatapai");
                count.should.equal(9);
                
            });
        });
            
    });
    describe('Actions', function() {
        beforeEach(function() {
            streamstub = {
                remoteAddress: "",
                setKeepAlive: function() {},
                addListener: function() {},
                write: function() { }
            };
            server = jrc.createServer("127.0.0.1",{debug:false, silent:true, masters:{"TestMaster":"2ceb02a85f6d4de6c28b2e59fda886d526dafb0d"}},{});
            client = new Client(server,streamstub);
            client.handleErrors = false;
            server.addClient(client);
        });

        it('should correctly handle incoming login requests for users for whom a password is required', function() {
            //this test assumes that the server's password requirement mechanism works.
            var threw = false;
            try {
                server.setName(client,'TestMaster');
            } catch(error) {
                
                error.should.be.an.instanceof(errors.PasswordRequiredError);
                error.name.should.equal("PasswordRequiredError");
                // no requirement on message..
                error.username.should.equal("TestMaster");
                threw = true;
            }
            threw.should.be.true;

        });
    });
});