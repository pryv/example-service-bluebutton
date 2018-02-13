var http = require('http'),
    logger = require('winston');

var app = require('./app'),
    config = require('./config'),
    version = require('../package.json').version;

var server = http.createServer( app);

var db = require('./storage/db.js');
db.load();

server.listen(config.get('http:port'), config.get('http:ip'), function () {
  logger.info('Service Bluebutton v' + version + ' in ' + app.settings.env +
    ' mode listening on: http://' + config.get('http:ip') + ':' + config.get('http:port'));
}).on('error', function (e) {
  logger.error('Failed to listen on ' + config.get('http:ip') + ':' + config.get('http:port') +
    ': ' + e);
  throw new Error(e);
});
