'use strict';

const path = require('path');
const Hapi = require('hapi');

exports.create = function(config) {
  const server = new Hapi.Server();

  return server.register([
    require('vision'),
    require('inert')
  ])
    .then(() => {
      const {host, port} = config;
      server.connection({host, port});

      server.views({
        engines: {
          hbs: require('handlebars')
        },
        relativeTo: path.join(__dirname, '..', '..'),
        path: 'views',
        isCached: this.config !== 'development'
      });

      server.route(require('./routes'));
      return server;
    });
};
