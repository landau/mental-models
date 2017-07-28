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

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

const bulk = $('h4').map((i, el) => {
  const $heading = $(el);
  const group = $heading.text();

  const items = $heading
    .next()
    .find('li')
    .map((i, el) => $(el).text())
    .get();

  return items.map(item => {

    const [main, related] = item.split('(related:');

    let frequency;
    let name;
    let body;

    try {
      const [part1, part2] = main.split('—');
      frequency = parseInt(part1.match(/\((\d)\)/)[1], 10);
      name = part1.slice(3).trim();
      body = capitalize(part2.trim().replace(/“|”/g, ''));
    } catch (e) {
      console.log('Failed to parse item.');
      console.log(group, main);
      throw e;
    }

    const doc = { group, frequency, name, body };

    if (related) {
      doc.related = related
        .trim()
        .replace(/\)\.?$/, '')
        .split(';')
        .map(s => {
          return capitalize(s.trim())
            .replace(/“|”/g, '');
        });
    }

    return doc;
  });
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
