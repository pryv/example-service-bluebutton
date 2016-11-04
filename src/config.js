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
    domain : 'domocare.io',
    access : 'https://reg.domocare.io/access',
    userCreation: 'https://reg.domocare.io/user',
    register: 'https://reg.domocare.io',
    hostingProvider: 'exoscale.ch-ch',
    appId: 'bridge-domocare'
  },
  domocare: {
    clientId: 'domocare-all',
    secret: 'setInHeadsetConfig',
    origin: 'https://sw.domocare.io'
  },
  oauth: {
    secretPath: 'setElsewhere'
  },
  http: {
    port: '8080',
    ip: '0.0.0.0' // interface to bind,
  },
  redis: {
    password: 'D0m0b12idG3-p4s5w012d',
    port : 6379
  },
  debug: {
    middlewareDebug : true
  },
  airbrake: {
    key: 'ToGenerateOne' // to generate one for bridge-domocare
  },
  pryvAccess: {  // access params of pryv.io token
    name: 'domocareBridgeAccess',
    permissions: [
      {
        streamId: '*',
        level: 'manage'
      }
    ]
  }
});

if (process.env.NODE_ENV === 'test') {
  nconf.set('http:port', '9443');
}