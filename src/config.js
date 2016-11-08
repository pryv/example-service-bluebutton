var nconf = require('nconf'),
    fs = require('fs'),
    path = require('path');

module.exports = nconf;

nconf.argv().env();

var configFile = null;

if (typeof(nconf.get('config')) !== 'undefined') {
  configFile = nconf.get('config');
}


if (fs.existsSync(configFile)) {
  configFile = fs.realpathSync(configFile);
  logger.info('using custom config file: ' + configFile);
} else {
  if (configFile) {
    logger.error('Cannot find custom config file: ' + configFile);
  }
}

if (configFile) {
  nconf.file({ file: configFile});
}

var certKey = __dirname + '/../node_modules/rec-la/src/' + 'rec.la' + '-';

// Set default values
nconf.defaults({
  serverOptions: {
    key: fs.readFileSync(certKey + 'key.pem').toString(),
    cert: fs.readFileSync(certKey + 'cert.crt').toString(),
    ca: fs.readFileSync(certKey + 'ca.pem').toString()
  },
  pryv: {
    domain : 'pryv.me',
    access : 'https://reg.pryv.me/access',
    appId: 'backup-test'
  },
  http: {
    port: '3443',
    cert: 'rec.la',
    hostname: 'l.rec.la',
    ip: '127.0.0.1' // interface to bind,
  },
  debug: {
    middlewareDebug : true
  },
  airbrake: {
    key: 'ToGenerateOne' // to generate one for bridge-domocare
  },
  pryvAccess: {  // access params of pryv.io token
    name: 'backup-service',
    permissions: [
      {
        streamId: '*',
        level: 'read'
      }
    ]
  },
  db: {
    path: path.normalize(__dirname + '/../db-files/')
  }
});

if (process.env.NODE_ENV === 'test') {
  nconf.set('http:port', '9443');
}