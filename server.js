'use strict'

require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT;
const express = require('express');
const app = express();
app.use(cors());
const superagent = require('superagent');

//Routes

app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);
app.use('*', notFound);

// constructor function
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

function Weather(description, time) {
  this.forecast = description;
  this.time = time;
}

function Trail(object) {
  this.name = object.name;
  this.location = object.location;
  this.length = object.length;
  this.stars = object.stars;
  this.star_votes = object.starVotes;
  this.summary = object.summary;
  this.trail_url = object.url;
  this.conditions = object.conditionDetails;
  this.condition_date = object.conditionDate.slice(0, 10);
  this.condition_time = object.conditionDate.slice(11, 19);
}
//functions
function locationHandler(request, response) {
  let city = request.query.city;
  let key = process.env.GEOCODE_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
  superagent.get(url)
    .then(data => {
      let location = data.body[0];
      const infoThroughConstruct = new Location(city, location);
      response.send(infoThroughConstruct);
    })
    .catch((error) => {
      console.log('Error', error);
      response.status(500).send('sorry, something went wrong');
    });

}
function weatherHandler(request, response) {
  try {
    const lat = request.query.latitude;
    const lon = request.query.longitude;
    let key = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${key}`;
    superagent.get(url)
      .then(results => {
        let weatherData = results.body.data;
        let weatherDataSlice = weatherData.slice(0, 8);
        response.send(weatherDataSlice.map(value => new Weather(value.weather.description, value.datetime)));
      })
  }
  catch (error) {
    console.log('ERROR', error);
    response.status(500).send('So sorry, something went wrong.');
  }
}
function trailHandler(request, response) {
  try {
    const lat = request.query.latitude;
    const lon = request.query.longitude;
    let key = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;
    superagent.get(url)
    .then(results => {
      let trailData = results.body.trails;
      response.send(trailData.map(value => new Trail(value)));
    })
  }
  catch (error) {
    console.log('ERROR', error);
    response.status(500).send('So sorry, something went wrong.');
  }
}

function notFound(request, response) {
  response.status(404).send('Sorry, Not Found');
}
//server is listening
app.listen(PORT, () => {
  console.log(`Server is ALIVE and listening on port ${PORT}`);
});
