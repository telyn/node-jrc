constants = require("./constants.js");
module.exports = function(line) {
    this.time = null;
    this.command = null;
    this.subcommand = null;
    this.subsubcommand = null;
    this.undo  = false;

    line = line.trim();
    var self = this;
    
    //returns true for commands like HcCreatures
    var hasSubcommand = function() {
        switch(self.command) {          
            case constants.WHOIS:
                return (self.params[0][0] == 'A');
            case constants.PASSWORD:
                return true;
            case constants.NUMERICINFO:
            case constants.GENERALINFO: // client-to-server
                return (self.params.length < 2) || (self.params[0][0] == 'c');
            case constants.SERVERMESSAGE:
                return true;
            default:
                return false;
        }
    };

    // Returns true for commands like ^<CLIENT>\tA<NAME>

    var hasSeparateSubcommand = function() {
        switch(self.command) {
            case constants.WHOIS:
                return (self.params[0][0]!="A");
            case constants.GENERALINFO: // server-to-client
                return (self.params[0][0]!='c') && (self.params.length >= 2);
            default:
                return false;
        }
    };
        

    var hasSubsubcommand = function() {
        switch(self.command + self.subcommand) {
            case constants.WHOIS + constants.INFO:
                return true;
            default:
                return false;
        }
    };

    if(line[0] == constants.MESSAGE_TIME) {
        var timestring = line.slice(1,line.indexOf("\t"));
        line = line.slice(line.indexOf("\t")+1,line.length);
        var timeregex = /^((\d+)w)?((\d+)d)?((\d+)h)?((\d+)m)?((\d+)s)?((\d)+ms)?$/;
        var matches = timeregex.exec(timestring);
        if(matches === null) {
            throw {
                name: "InvalidMessageError",
                message: "Invalid time specifier"
            };
        }

        this.time = (parseInt(matches[ 2],10) || 0);               // weeks
        this.time = (parseInt(matches[ 4],10) || 0) + (this.time *  7); // days
        this.time = (parseInt(matches[ 6],10) || 0) + (this.time * 24); // hours
        this.time = (parseInt(matches[ 8],10) || 0) + (this.time * 60); // minutes
        this.time = (parseInt(matches[10],10) || 0) + (this.time * 60); // seconds
        this.time = (parseInt(matches[12],10) || 0) + (this.time * 1000); // milliseconds

    }

    if(line[0] == constants.MESSAGE_UN) {
       this.undo = true; 
       //adjust line
    }

    
    this.command = line[0];
    this.line = line;
    this.params = line.split("\t");
    this.params[0] = this.params[0].slice(1,this.params[0].length);
    
    
    //whois are the only class of commands who can have their 
    //subcommand even further away, so we massage them into a
    //regular separate-subcommand style here.
    if(this.command == constants.WHOIS) {
        if(this.params[1] == "entrywhois" || this.params[1] == "autowhois" || this.params[1] == "whois") {
            var i;
            for(i=1;i<this.params.length;i++) {
                this.params[i-1] = this.params[i];
            }
            this.params.pop();
        }
    }

    //whois now get processed as a usual subcommand here
    if(hasSeparateSubcommand()) {
        this.subcommand = this.params[1][0];
        this.params[1] = this.params[1].slice(1,this.params[1].length);
        if(this.params[0] == "") {
            this.params.shift();
        }
        if(hasSubsubcommand() && this.params.length >= 2) {
            this.subsubcommand = this.params[1][0];
            this.params[1] = this.params[1].slice(1,this.params[1].length);
            if(this.params[0] == "") {
                this.params.shift();
            }
        }
    } else if(hasSubcommand()) {
        this.subcommand = this.params[0][0];
        this.params[0] = this.params[0].slice(1,this.params[0].length);
        if(hasSubsubcommand() && this.params.length >= 2) {
            this.subsubcommand = this.params[0][0];
            this.params[0] = this.params[0].slice(1,this.params[0].length);
        }
    } 

    if(this.command == constants.WHOIS && this.subcommand == constants.INFO && this.subsubcommand == constants.USERINFO) {
        var i,j;
        for(i = 1; i<this.params.length-1; i+=2) {
            
            var records = {};
            var raw_records = this.params[i+1].split(constants.RECORD_SEPARATOR);
            for(j = 0; j < raw_records.length; j++) {
                var kv = raw_records[j].split(constants.FIELD_SEPARATOR);
                records[kv[0]] = kv[1];
            }
            this.params[i+1] = records;
            
        }
    }

    if(this.params.length == 1) {
        if(this.params[0] == "") {
            this.params.shift();
        }
    }
    
    this.print = function(log) {
        log("\tMessage {");
        log("\t\tTime: "+this.time);
        log("\t\tUndo: "+(this.undo?"true":"false"));
        log("\t\tCommand: "+this.command);
        log("\t\tParams: "+JSON.stringify(this.params));
        log("\t\tSubcommand: "+this.subcommand);
        log("\t\tSubsubcommand: "+this.subsubcommand);
        log("\t}");
    };
};