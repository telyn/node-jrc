var server = require('./lib/server.js')
  , Client = require('./lib/client.js');

module.exports = {
    createServer: server.createServer,
    Client: Client
}
