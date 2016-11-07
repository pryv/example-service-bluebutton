var ready = require('readyness'),
    https = require('https'),
    logger = require('winston'),
    fs = require('fs');

var app = require('./app'),
    config = require('./config'),
    version = require('../package.json').version;

ready.setLogger(logger.info);

var certKey = __dirname + '/../node_modules/rec-la/src/' + config.get('http:cert') + '-';
var serverOptions = {
  key: fs.readFileSync(certKey + 'key.pem').toString(),
  cert: fs.readFileSync(certKey + 'cert.crt').toString(),
  ca: fs.readFileSync(certKey + 'ca.pem').toString()
};

var server = https.createServer(serverOptions, app);

var appListening = ready.waitFor('Service backup v' + version + ' in ' + app.settings.env +
  ' mode listening on:' + config.get('http:ip') + ':' + config.get('http:port'));

server.listen(config.get('http:port'), config.get('http:ip'), function () {
  appListening();
}).on('error', function (e) {
  logger.error('Failed to listen on ' + config.get('http:ip') + ':' + config.get('http:port') +
    ': ' + e);
  throw new Error(e);
});
