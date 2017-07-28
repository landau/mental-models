'use strict';

const path = require('path');
const Hapi = require('hapi');

exports.create = function(config, logger) {
  const server = new Hapi.Server();
  const {host, port} = config;
  server.connection({host, port});

  return server.register([
    require('vision'),
    require('inert'),
    {
      register: require('hapi-bunyan'),
      options: {
        logger,
        skipUndefined: false
      }
    }
  ])
    .then(() => {
      require('./response-logger').attach(server, logger);

      server.views({
        engines: {
          hbs: require('handlebars')
        },
        relativeTo: path.join(__dirname, '..', '..'),
        path: 'views',
        isCached: this.config !== 'development'
      });

      server.route(require('./routes'));
    })
    .then(() => server);
};
