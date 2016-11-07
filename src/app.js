var express = require('express'),
    bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// routes
app.use('/login', require('./routes/login'));

console.log('loaded')

module.exports = app;