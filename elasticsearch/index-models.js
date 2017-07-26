#!/usr/bin/env node
'use strict';

const [a, b, INDEX] = process.argv;

if (!INDEX) {
  throw new Error('index not specified');
}

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const {Client} = require('elasticsearch');
const FILE_NAME = 'mental-models-i-find-repeatedly-useful-936f1cc405d.html';
const file = fs.readFileSync(path.join(__dirname, FILE_NAME), 'utf8');

const $ = cheerio.load(file);

const bulk = $('h4').map((i, el) => {
  const $heading = $(el);
  const group = $heading.text();

  const items = $heading
    .next()
    .find('li')
    .map((i, el) => $(el).text())
    .get();

  return items.map((body, j) => ({ group, body }));
})
  .get()
  .map((model, i) => Object.assign({ id: i + 1 }, model))
  .reduce((acc, model) => {
    return acc.concat(
      {index: { _index: INDEX, _type: 'model', _id: model.id}},
      model
    );
  }, []);

const client = new Client({ host: 'localhost:9200' });

console.log('Indexing models...');
client.ping({ requestTimeout: 1000 })
  .then(() => client.bulk({ body: bulk }))
  .then(() => console.log('Finished.'))
  .catch(err => {
    setImmediate(() => {
      throw err;
    });
  });
