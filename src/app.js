var express = require('express'),
  bodyParser = require('body-parser'),
  path = require('path');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// routes
app.use('/login', require('./routes/login'));
app.use('/status', require('./routes/status'));
app.use('/delete', require('./routes/delete'));

console.log('Path of HTML File: ' + path.normalize(__dirname + '/../dist/index.html'), ' [CONSOLE.LOG IN APP.JS TO DELETE]');
app.use('/', express.static(path.normalize(__dirname + '/../dist/index.html')));

module.exports = app;