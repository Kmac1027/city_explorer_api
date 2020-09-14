'use strict'

require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT;
const express = require('express');
const app = express();
app.use(cors());

//Routes

app.get('/location', locationHandler);
app.use('*', notFound);

// constructor function
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

//functions
function notFound(request, response) {
  response.status(404).send('Sorry, Not Found');
}

function locationHandler(request, response) {
  try {
    const city = request.query.city;
    const data = require('./data/location.json');
    console.log(data);
    const locationData = new Location(city, data[0]);
    console.log(locationData);
    response.status(200).json(locationData);
  }
  catch (error) {
    console.log('ERROR', error);
    response.status(500).send('So sorry, something went wrong.');
  }
}

//server is listening
app.listen(PORT, () => {
  console.log(`Server is ALIVE and listening on port ${PORT}`);
})
