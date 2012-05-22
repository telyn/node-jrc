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
    
    
});