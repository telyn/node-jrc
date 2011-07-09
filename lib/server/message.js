constants = require("../constants.js");
Message = function(line) {
    this.time = null;
    this.command = null;
    this.subcommand = null;
    this.subsubcommand = null;
    this.undo  = false;

    line = line.trim();
    
    this.hasSubcommand = function() {
        switch(this.command) {
            case constants.WHOIS:
                return true;
            default:
                return false;
        }
    };

    this.hasSubsubcommand = function() {
        switch(this.command + this.subcommand) {
            case constants.WHOIS + constants.INFO:
                return true;
            default:
                return false;
        }
    }

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

    if(this.hasSubcommand()) {
        this.subcommand = this.params[1][0];
        this.params[1] = this.params[1].slice(1,this.params[1].length);
        if(this.hasSubsubcommand()) {
            this.subsubcommand = this.params[1][0];
            this.params[1] = this.params.slice(1,this.params[1].length);
        }
    }
    
    this.print = function() {
        console.log("Message {");
        console.log("\tTime: "+this.time);
        console.log("\tUndo: "+(this.undo?"true":"false"));
        console.log("\tCommand: "+this.command);
        console.log("\tParams: "+JSON.stringify(this.params));
        console.log("\tSubcommand: "+this.subcommand);
        console.log("\tSubsubcommand: "+this.subsubcommand);
        console.log("}");
    };
};
