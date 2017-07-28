'use strict';

const Search = require('./search');
const Server = require('./server');
const bunyan = require('bunyan');

class App {
  constructor(config) {
    this.config = config;
    this.logger = bunyan.createLogger({
      name: config.log.name,
      level: config.log.level
    });
  }

  _getSearchClient() {
    return Search.createClient(this.config.elasticsearch)
      .then(client => this.client = client);
  }

  _getServer() {
    return Server.create(
      this.config.server,
      this.logger.child({module: 'server'})
    )
      .then(server => this.server = server);
  }

  start() {
    return Promise.all([
      this._getSearchClient(),
      this._getServer()
    ])
      .then(([client, server]) => {
        server.app.es = client;
        server.app.config = this.config;
        return this.server.start();
      });
  }

  stop() {
    return this.server.stop();
  }
}

module.exports = App;
