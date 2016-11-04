var ready = require('readyness'),
    https = require('https'),
    logger = require('winston');

var app = require('./app'),
    config = require('./config'),
    version = require('../package.json').version;

ready.setLogger(logger.info);

var server = https.createServer(app);

var appListening = ready.waitFor('Service backup v' + version + ' in ' + app.settings.env +
  ' mode listening on:' + config.get('http:ip') + ':' + config.get('http:port'));

server.listen(config.get('http:port'), config.get('http:ip'), function () {
  appListening();
}).on('error', function (e) {
  logger.error('Failed to listen on ' + config.get('http:ip') + ':' + config.get('http:port') +
    ': ' + e);
  throw new Error(e);
});


