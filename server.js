'use strict'

require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const app = express();

app.use(expres.static ('./public'));

app.listen(PORT, () => {
  console.log(`Server is ALIVE and listening on port ${PORT}`)
})
