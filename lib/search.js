'use strict';

const {Client} = require('elasticsearch');

exports.createClient = function(config) {
  const client = new Client({
    host: `${config.host}:${config.port}`,
    log: config.log
  });

  return client.ping({ requestTimeout: 1000 })
    .then(() => client);
};
