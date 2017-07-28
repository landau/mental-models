'use strict';

const Server = require('./lib');

const toInt = n => parseInt(n, 10);
const {env} = process;

const config = {
  env: env.NODE_ENV || 'development',
  host: env.NODE_HOST || 'localhost',
  port: toInt(env.NODE_PORT) || 8080,
  log: {
    level: env.NODE_LOG_LEVEL || 'info'
  },
  elasticsearch: {
    host: env.NODE_ELASTICSEARCH_HOST || 'localhost',
    port: toInt(env.NODE_ELASTICSEARCH_PORT) || 9200,
    log: env.NODE_ELASTICSEARCH_LOG || env.NODE_LOG_LEVEL || 'info',
    index: env.NODE_ELASTICSEARCH_INDEX || 'models'
  }
};

const server = new Server(config);

server.start()
  .then(() => {
    console.log('Server started');
  })
  .catch(err => {
    setImmediate(() => {
      throw err;
    });
  });
