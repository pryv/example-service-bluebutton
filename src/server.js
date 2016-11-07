var https = require('https'),
    logger = require('winston');

var app = require('./app'),
    config = require('./config'),
    version = require('../package.json').version;

var serverOptions = require('rec-la').httpsOptions;

var server = https.createServer(serverOptions, app);

var db = require('./storage/db.js');
db.load();

db.save('toto', {zut: 9});

server.listen(config.get('http:port'), config.get('http:ip'), function () {
  logger.info('Service backup v' + version + ' in ' + app.settings.env +
    ' mode listening on:' + config.get('http:ip') + ':' + config.get('http:port'));
}).on('error', function (e) {
  logger.error('Failed to listen on ' + config.get('http:ip') + ':' + config.get('http:port') +
    ': ' + e);
  throw new Error(e);
});
