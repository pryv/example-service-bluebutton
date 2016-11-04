var nconf = require('nconf'),
  fs = require('fs');

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

// Set default values
nconf.defaults({
  pryv: {
    domain : 'pryv.li',
    access : 'https://reg.pryv.li/access',
    appId: 'backup-test'
  },
  testUser: {
    username: 'backupServiceTest',
    password: 't3st3rP4ssw0rd'
  },
  oauth: {
    secretPath: 'setElsewhere'
  },
  http: {
    port: '8080',
    ip: '0.0.0.0' // interface to bind,
  },
  redis: {
    password: 'B4ckUp5-p45sW0rD5',
    port : 6379
  },
  debug: {
    middlewareDebug : true
  },
  pryvAccess: {  // access params of pryv.io token
    name: 'domocareBridgeAccess',
    permissions: [
      {
        streamId: '*',
        level: 'read'
      }
    ]
  }
});