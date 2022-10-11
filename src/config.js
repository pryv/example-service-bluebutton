var nconf = require('nconf'),
    fs = require('fs'),
    path = require('path');

module.exports = nconf;

nconf.use('memory');
nconf.argv().env();

var configFile = null;

if (typeof(nconf.get('config')) !== 'undefined') {
  configFile = nconf.get('config');
}

// build prod environment
if (process.env.APP_CONFIG) {
  configFile = process.env.APP_CONFIG;
}

if (fs.existsSync(configFile)) {
  configFile = fs.realpathSync(configFile);
  console.log('Using custom config file: ' + configFile);
} else {
  if (configFile) {
    console.log('Cannot find custom config file: ' + configFile);
  }
}

if (configFile) {
  nconf.file({ file: configFile});
}

// Set default values
nconf.defaults({
  pryv: {
    serviceInfoUrl : 'https://reg.pryv.me/service/info',
    appId: 'bluebutton-app',
    enforceDomain: false
  },
  http: {
    port: '9000',
    ip: '0.0.0.0' // interface to bind,
  },
  db: {
    path: path.normalize(__dirname + '/../db-files/'),
    backup: path.normalize(__dirname + '/../backup/'),
    download: path.normalize(__dirname + '/../download/'),
    ttl: 3600000
  }
});

if (process.env.NODE_ENV === 'test') {
  nconf.set('http:port', '9443');
}