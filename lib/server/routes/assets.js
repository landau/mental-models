'use strict';

const path = require('path');

module.exports =   {
  method: 'GET',
  path: '/assets/{param*}',
  config: {
    tags: ['assets']
  },
  handler: {
    directory: {
      path: path.join(__dirname, '..', '..', '..', 'assets')
    }
  }
};
