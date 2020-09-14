'use strict'

require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT;
const express = require('express');
const app = express();

//Routes
app.use('*', notFound);
app.use(cors());

app.get('/', (request, response) => {
  console.log("alive?");
  // response.sendFile('./public/index.html');
  response.send('hello world');
})


//functions
function notFound() {
  response.status(404).send('Sorry, Not Found');
}



//server is listening
app.listen(PORT, () => {
  console.log(`Server is ALIVE and listening on port ${PORT}`);
})
