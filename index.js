'use strict';

const Server = require('./lib');

const {env} = process;
const config = {
  env: env.NODE_ENV || 'development',
  host: env.NODE_HOST || 'localhost',
  port: parseInt(env.NODE_PORT, 10) || 8080
}

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
