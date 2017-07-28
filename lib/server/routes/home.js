'use strict';


module.exports = {
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
};
