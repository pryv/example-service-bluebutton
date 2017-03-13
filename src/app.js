var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    config = require('./config');

var app = express();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// routes
app.use('/login', require('./routes/login'));
app.use('/status', require('./routes/status'));
app.use('/delete', require('./routes/delete'));
app.use('/download', express.static(config.get('db:download')));

app.use('/', express.static(path.normalize(__dirname + '/../dist')));

module.exports = app;