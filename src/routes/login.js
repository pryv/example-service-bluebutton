const express = require('express');
const router = express.Router();
const db = require('../storage/db');
const config = require('../config');
const backup = require('app-node-backup');
const _ = require('lodash');

router.post('/', async function (req, res) {
  const body = req.body;
  const password = body.password;
  const username = body.username;
  let domain = null;

  if (! username || ! password) {
    return res.status(400).send('Please provide your username and password');
  }

  const serviceInfoUrl = config.get('pryv:serviceInfoUrl');
  var params = {
    'username': username,
    'password': password,
    'serviceInfoUrl': serviceInfoUrl
  };

  backup.signInToPryv(params, function(err, connection) {
    if(err) {
      // Trick to return a user readable error in case of host not found
      if(err.indexOf && err.indexOf('ENOTFOUND') !== -1) {
        err = 'Username not found';
      }
      return res.status(400).send(err);
    }

    if(!config.get('pryv:enforceDomain') && body.domain) {
      domain = body.domain;
    } else {
      domain = connection.settings.domain;
    }
    config.set('pryv:domain', domain);

    // Save token
    var token = connection.auth;
    db.save(connection.username, domain, 'token', token);

    if(!db.infos(username, domain).running) {
      // Start backup
      var params = {
        'backupDirectory' : db.backupDir(username, domain),
        /* jshint ignore:start */
        'includeAttachments' : (body.includeAttachments != 0),
        'includeTrashed' : (body.includeTrashed != 0)
        /* jshint ignore:end */
      };
      backup.startOnConnection(connection, params,
        _.bind(backupComplete, null, _, username, domain, password),
        _.bind(db.appendLog, null, username, domain));
      db.save(username, domain, 'running', true);
    }

    res.status(200).send({'token': token, 'log': db.log(username, domain)});
  });
});

var backupComplete = function(err, username, domain, password) {
  if(err) {
    db.appendLog(username, domain, err, true);
    db.deleteBackup(username, domain, function(err) {
      if(err) {
        return console.log(err);
      }
    });
  }
  db.createZip(username, domain, password, function(err, file) {
    if (err) {
      db.appendLog(username, domain, 'Zip creation error', true);
      db.deleteBackup(username, domain, function(err) {
        if(err) {
          return console.log(err);
        }
      });
    }
    db.appendLog(username, domain, 'Backup completed!');
    db.appendLog(username, domain, 'Backup file: ' + file, true);

    var ttl = config.get('db:ttl');
    if(ttl) {
      setTimeout(function(){
        db.deleteBackup(username, domain, function(err) {
          if(err) {
            return console.log(err);
          }
        });
      }, ttl);
    }
  });
};

module.exports = router;
