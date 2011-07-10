var jrc = require("./lib/server.js");
var fs = require("fs");

var config = JSON.parse(fs.readFileSync("./config.json"));

server = jrc.createServer("127.0.0.1",config);
server.listen(41528);
