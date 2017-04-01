/*
This script was written to generate a data.json file based on a wget of lots of html files :)
*/
const fs = require('fs');
const cheerio = require('cheerio');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const people = [];

// iterate through the alphabet
alphabet.forEach((letter) => {
  const $     = cheerio.load(fs.readFileSync(`data/${letter}.html`, { encoding: 'utf8' }));
  const rows  = $('table[cellpadding=5] tr');
  const total = rows.length;

  rows.each((i, el) => {
    const $el = $(el);
    const cols = $el.children('td');

    // table props
    const name       = $(cols[0]).text();
    const occupation = $(cols[1]).text();
    const knownFor   = $(cols[2]).text();
    const birth      = $(cols[3]).text();
    const death      = $(cols[4]).text();

    console.log(`Processing ${letter}.html\t${i}/${total}\t${name}`);

    // make a person
    const person = {
      name,
      occupation,
      knownFor,
      birth,
      death
    };

    people.push(person);
  });
});

fs.writeFileSync('data/data.json', JSON.stringify(people));
console.log('Done!');