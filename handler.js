/*
This is the lambda function deployed with `serverless deploy`
*/
'use strict';

const _ = require('underscore');
const fs = require('fs');
const AWS = require('aws-sdk');
const handlebars = require('handlebars');
const moment = require('moment');
const people = require('./data/people.json');
const cities = require('./data/cities.json');
const source = fs.readFileSync('./public/event.html', { encoding: 'utf8' });
const template = handlebars.compile(source);

// AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const bucket = process.env.S3_BUCKET;
const S3 = new AWS.S3();

// extend array
Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};

// shuffle array
Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if (i == 0) return this;
  while (--i) {
    j = Math.floor(Math.random() * (i + 1));
    temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
  return this;
}

// capitalize
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/*
Search based on a name
Result: {
  "name": "Lee Aaker",
  "occupation": "Actor",
  "knownFor": "The Adventures of Rin Tin Tin",
  "birth": "25-Sep-1943",
  "death": "-"
}
*/
function search(q) {
  return _.filter(people, (person) => {
    return (
      (person.name.indexOf(q) >= 0) &&
      (person.death === '-')
    );
  });
}

/* 
Pick random speakers
Result: [
  person,
  ...
]
*/
function randomSpeakers(q) {
  const speakers = search(q);
  if (speakers.length >= 3) {
    return speakers.shuffle().splice(0, 6);
  } else {
    return false;
  }
}

/*
Pick a random weekend this year
Result: MM.DD.YYYY - MM.DD.YYYY
*/
function randomWeekend() {
  const rDays  = Math.round((Math.random() * 25) + 10) * 7;
  const start  = moment('2017-03-31T00:00:00.000').add(rDays, 'days');
  const end    = moment(start).add(1, 'days');
  const format = 'MM.DD.YYYY';

  return {
    friday: start.format(format),
    saturday: end.format(format)
  };
}

/*
Pick a random city
Result: {
  city: 'Atlanta',
  country: 'USA',
  image: 'http://robohash.org/atlanta'
}
*/
function randomCity() {
  return cities.sample();
}

// generate a random event with a city, date and speakers
function randomEvent(name, callback) {
  const speakers = randomSpeakers(name);
  const rcity = randomCity();
  const city = `${rcity.city}, ${rcity.country}`;
  const image = rcity.image;
  const { friday, saturday } = randomWeekend();
  const date = `${friday} - ${saturday}`;
  const filename = `${name.toLowerCase()}.html`;

  // set params for the S3 file
  var params = {
    Bucket: bucket,
    Key: filename,
    ACL: 'public-read',
    ContentType: 'text/html'
  };

  // make sure we have enough to generate an event
  if (speakers) {
    const data = {
      speakers,
      city,
      date,
      name,
      friday,
      saturday,
      image,
    };

    params['Body'] = template(data);
  } else {
    const notReady = fs.readFileSync('./public/not-ready.html', { encoding: 'utf8' });
    params['Body'] = notReady.replace(/\{\{name\}\}/g, name);
  }

  // create the template
  S3.putObject(params, function (err, res) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  'Access-Control-Allow-Origin': "http://www.mynamecon.com"
};

// export the main
module.exports.namecon = (event, context, callback) => {
  var name;

  // make sure we get the name value
  if (event.body.indexOf('=') >= 0) {
    var parts = event.body.split('=');
    if (parts.length > 0) {
      if (parts[0] === 'name') {
        name = parts[1];
      } else {
        context.fail(new Error('Malformed name parameter'));
      }
    } else {
      context.fail(new Error('No parameters defined'));
    }
  } else {
    var input = JSON.parse(event.body);
    name = input['name'];
  }

  // we still didn't get a name so there's an error
  if (name == undefined) {
    context.fail(new Error('You must have a defined name'));
  } else {
    const filename = `${name.toLowerCase()}.html`;
    const params = {
      Bucket: bucket,
      Key: filename,
    };

    // check if it exists
    S3.getObject(params, (err, data) => {
      if (err) {
        if (err.code === 'NoSuchKey') {
          randomEvent(name.toLowerCase().capitalize(), (err) => {
            if (err) {
              context.fail(err);
            } else {
              context.succeed({
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({ message: 'success' }),
              });
            }
          });
        } else {
          context.fail(err);
        }
      } else {
        context.succeed({
          statusCode: 304,
          headers: headers,
          body: JSON.stringify({ message: 'unmodified' }),
        });
      }
    });
  }
};
