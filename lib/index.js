'use strict';

const path = require('path');
const Hapi = require('hapi');
const {Client} = require('elasticsearch');

class Server {
  constructor(config) {
    this.config = config;
    this.server = new Hapi.Server();

    this.es = new Client({
      host: `${config.elasticsearch.host}:${config.elasticsearch.port}`,
      log: config.elasticsearch.log
    });
  }

  _registerPlugins() {
    return this.server.register([
      require('vision'),
      require('inert')
    ]);
  }

  _startEs() {
    return this.es.ping({ requestTimeout: 1000 });
  }

  _configure() {
    const {host, port} = this.config;
    this.server.connection({host, port});

    this.server.app.config = this.config;
    this.server.app.es = this.es;

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
      path: 'views',
      isCached: this.config !== 'development'
    });

    this.server.route({
      method: 'GET',
      path: '/',
      config: {
        tags: 'homepage'
      },
      handler(request, reply) {
        const {config, es} = request.server.app;
        const {query} = request.query;

        let esQuery = {
          match_all: {} // eslint-disable-line camelcase
        };

        if (query) {
          esQuery = {
            multi_match: { // eslint-disable-line camelcase
              query,
              fields: ['group', 'name^1.5', 'body', 'related']
            }
          };
        }

        const {index} = config.elasticsearch;

        const body = {
          sort: {
            frequency: {
              order: 'asc'
            }
          },
          query: esQuery,
          aggs: {
            groups: {
              terms: {field: 'group.raw'}
            }
          }
        };

        console.log(JSON.stringify(body, null, '  '));

        es.search({ index, body })
          .then(result => {
            // console.log(require('util').inspect(result, { depth: null }));
            reply.view('index.hbs', {
              results: result.hits.hits,
              query
            });
          })
          .catch(err => {
            console.log(err);
            reply(err);
          });
      }
    });
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
