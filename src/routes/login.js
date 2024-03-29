const express = require('express');
const router = express.Router();
const db = require('../storage/db');
const config = require('../config');
const backup = require('@pryv/account-backup');
const _ = require('lodash');
const pryv = require('pryv');

router.post('/', async function (req, res) {
  const body = req.body;
  const password = body.password;
  let username = body.username;

  if (!username || !password) {
    return res.status(400).send('Please provide your username and password');
  }

  let serviceInfoUrl;
  if (!config.get('pryv:enforceDomain') && body.serviceInfoUrl) {
    serviceInfoUrl = body.serviceInfoUrl;
  } else {
    serviceInfoUrl = config.get('pryv:serviceInfoUrl');
  }

  // check if username is an email 
  if (username.indexOf('@') > -1) {
    try {
      const service = new pryv.Service(serviceInfoUrl);
      const infos = await service.info();
      const userInfo = await pryv.utils.superagent.get(infos.register + username + '/username');
      if (! userInfo.body.username) { 
        return res.status(400).send('Cannot find user with email ' + username);
      }
      console.log('User ' + username + ' > ' + userInfo.body.username);
      username = userInfo.body.username;
    } catch (err) {
      return res.status(500).send('Internal error' + err.message);
    } 
  }

  var params = {
    'username': username,
    'password': password,
    'serviceInfoUrl': serviceInfoUrl
  };

  let connection = null;
  try {
    connection = await backup.signInToPryv(params);
  } catch (err) {
    // Trick to return a user readable error in case of host not found
    if (err.code && err.code.indexOf && err.code.indexOf('ENOTFOUND') !== -1) {
      err = new Error('Username not found');
    }
    return res.status(400).send(err.message);
  }

  const apiEndpoint = connection.apiEndpoint;
  db.save(apiEndpoint, 'apiEndpoint', apiEndpoint);

  if (!db.infos(apiEndpoint).running) {
    // Start backup
    var params = {
      'backupDirectory': db.backupDir(apiEndpoint),
      /* jshint ignore:start */
      'includeAttachments': (body.includeAttachments != 0),
      'includeTrashed': (body.includeTrashed != 0),
      /* jshint ignore:end */
      'apiUrl': connection.apiUrl
    };
    backup.startOnConnection(connection, params,
      _.bind(backupComplete, null, _, apiEndpoint, password),
      _.bind(db.appendLog, null, apiEndpoint));
    db.save(apiEndpoint, 'running', true);
  }
  res.status(200).send({ 'apiEndpoint': connection.apiEndpoint });
});

var backupComplete = function (err, apiEndpoint, password) {
  if (err) {
    db.appendLog(apiEndpoint, err, true);
    db.deleteBackup(apiEndpoint, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }
  db.createZip(apiEndpoint, password, function (err, file) {
    if (err) {
      db.appendLog(apiEndpoint, 'Zip creation error', true);
      db.deleteBackup(apiEndpoint, function (err) {
        if (err) {
          return console.log(err);
        }
      });
    }
    db.appendLog(apiEndpoint, 'Backup completed!');
    db.appendLog(apiEndpoint, 'Backup file: ' + file, true);

    var ttl = config.get('db:ttl');
    if (ttl) {
      setTimeout(function () {
        db.deleteBackup(apiEndpoint, function (err) {
          if (err) {
            return console.log(err);
          }
        });
      }, ttl);
    }
  });
};

module.exports = router;
