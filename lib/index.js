'use strict';

const path = require('path');
const Hapi = require('hapi');

class Server {
  constructor(config) {
    this.config = config;
    this.server = new Hapi.Server();
  }

  _registerPlugins() {
    return this.server.register([
      require('vision'),
      require('inert')
    ]);
  }

  _configure() {
    const {host, port} = this.config;
    this.server.connection({host, port});

    this.server.route({
      method: 'GET',
      path: '/assets/{param*}',
      config: {
        tags: ['assets']
      },
      handler: {
        directory: {
          path: path.join(__dirname, '..', 'assets')
        }
      }
    });

    this.server.views({
      engines: {
        hbs: require('handlebars')
      },
      relativeTo: path.join(__dirname, '..'),
      path: 'views'
    });

    this.server.route({
      method: 'GET',
      path: '/',
      config: {
        tags: 'homepage'
      },
      handler(request, reply) {
        reply.view('index.hbs');
      }
    })
  }

  start() {
    return this._registerPlugins()
      .then(() => {
        this._configure();
        return this.server.start();
      });
  }

  stop() {
    return this.server.stop();
  }
}

module.exports = Server;
