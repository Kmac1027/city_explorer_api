"use strict";

require("dotenv").config();
const cors = require("cors");
const PORT = process.env.PORT;
const express = require("express");
const app = express();
app.use(cors());
const superagent = require("superagent");
let pg = require("pg");
const { response } = require("express");
const dataBaseUrl = process.env.DATABASE_URL;
const client = new pg.Client(dataBaseUrl);
client.on('error', (err) => {
  console.err(err);
});
//Routes

app.get("/location", locationHandler);
app.get("/weather", weatherHandler);
app.get("/trails", trailHandler);
app.use("*", notFound);

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
//Route Handler Functions
function locationHandler(request, response) {
  let city = request.query.city;
  let key = process.env.GEOCODE_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
  const sql = `SELECT * FROM locations WHERE search_query=$1;`;
  const safeValues = [city];

  client.query(sql, safeValues).then((resultsFromSql) => {
    if (resultsFromSql.rowCount > 0) {

      const chosenCity = resultsFromSql.rows[0];
      console.log("*location* pulling from database");
      response.status(200).send(chosenCity);
    } else {
      superagent
        .get(url)
        .then((data) => {
          let location = data.body[0];
          console.log("*location* No data, must make API call");
          const infoThroughConstruct = new Location(city, location);
          const sql = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)`;
          const safeValues = [
            city,
            infoThroughConstruct.formatted_query,
            infoThroughConstruct.longitude,
            infoThroughConstruct.latitude,
          ];
          client.query(sql, safeValues);
          response.status(200).send(infoThroughConstruct);
        })
        .catch((error) => {
          console.log("Error", error);
          response.status(500).send("sorry, something went wrong");
        });
    }
  });
}

function weatherHandler(request, response) {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const formattedQuery = request.query.formatted_query;
  let key = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${key}`;
  const sql = `SELECT * FROM weather WHERE formatted_query=$1;`;
  const safeValues = [formattedQuery];
  
  client.query(sql, safeValues).then((resultsFromSql) => {
    const chosenweather = resultsFromSql[0];
    console.log(resultsFromSql)
    // let freshData = Date.parse(new Date(Date.now()).toLocaleDateString()) - Date.parse(resultsFromSql[0].time_of_day) < 864;
    if (resultsFromSql.rows.length === 0){
      superagent
        .get(url)
        .then((results) => {
          let weatherData = results.body.data;
          console.log("*weather* No data, must make API call");
          let weatherDataSlice = weatherData.slice(0, 8);
          let timeOfDay = Date.now();
          const sql = `INSERT INTO weather (formatted_query, weather_data_slice, time_of_day) VALUES ($1, $2, $3)`;
          const safeValues = [formattedQuery, JSON.stringify(weatherDataSlice), timeOfDay];
          console.log(timeOfDay);
          client.query(sql, safeValues).then(() => {
            response.send(
              weatherDataSlice.map(
                (value) =>
                  new Weather(value.weather.description, value.datetime)
              )
            );
          });
        })
        .catch((error) => {
          console.log("ERROR", error);
          response.status(500).send("So sorry, something went wrong.");
        });
    }
    else if (resultsFromSql.rowCount > 0 &&  Date.parse(new Date(Date.now())) - Date.parse(resultsFromSql.rows[0].time_of_day) < 864000) {
      console.log('*weather* pulling from database');
      response.status(200).send(chosenweather);
    } else {
      superagent
        .get(url)
        .then((results) => {
          let weatherData = results.body.data;
          console.log("*weather* old data, must make API call");
          let weatherDataSlice = weatherData.slice(0, 8);
          let timeOfDay = Date.now();
          const sql = `INSERT INTO weather (formatted_query, weather_data_slice, time_of_day) VALUES ($1, $2, $3)`;
          const safeValues = [formattedQuery, JSON.stringify(weatherDataSlice), timeOfDay];
          console.log(timeOfDay);
          client.query(sql, safeValues).then(() => {
            response.send(
              weatherDataSlice.map(
                (value) =>
                  new Weather(value.weather.description, value.datetime)
              )
            );
          });
        })
        .catch((error) => {
          console.log("ERROR", error);
          response.status(500).send("So sorry, something went wrong.");
        });
    }
  });
}

function trailHandler(request, response) {
  try {
    const lat = request.query.latitude;
    const lon = request.query.longitude;
    let key = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;
    superagent.get(url).then((results) => {
      let trailData = results.body.trails;
      response.send(trailData.map((value) => new Trail(value)));
    });
  } catch (error) {
    console.log("ERROR", error);
    response.status(500).send("So sorry, something went wrong.");
  }
}

function notFound(request, response) {
  response.status(404).send("Sorry, Not Found");
}

//server is listening
client
  .connect()
  .then(startServer)
  .catch((e) => console.log(e));

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is ALIVE and listening on port ${PORT}`);
  });
}

    // console.log(Json.stringify(route, null, 2))

    // .set('Authorization', 'Bearer API_KEY')
