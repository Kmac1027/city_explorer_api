'use strict'

require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT;
const express = require('express');
const app = express();
app.use(cors());
let weatherArray = [];

//Routes

app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
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
  weatherArray.push(this);


}
//functions
function locationHandler(request, response) {
  try {
    const city = request.query.city;
    const data = require('./data/location.json');
    const locationData = new Location(city, data[0]);
    response.status(200).json(locationData);
  }
  catch (error) {
    console.log('ERROR', error);
    response.status(500).send('So sorry, something went wrong.');
  }
}
function weatherHandler(request, response) {
  try {
    //const city = request.query.city;
    const weatherData = require('./data/weather.json');
    for (let i =0; i<weatherData.data.length; i++){
  new Weather (weatherData.data[i].weather.description, weatherData.data[i].datetime);
    }
    // let forecast = weatherData.data[0].weather.description;
    // let date = weatherData.data[0].datetime;
    // let dailyforcast = new Weather(forecast, date);
    // console.log(dailyforcast);
    response.status(200).send(weatherArray);
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
