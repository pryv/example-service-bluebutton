var express = require('express'),
    router = express.Router(),
    db = require('../storage/db'),
    config = require('../config'),
    backup = require('backup-node'),
    _ = require('lodash');

router.post('/', function (req, res) {

  var body = req.body,
      password = body.password,
      username = body.username,
      domain = body.domain || config.get('pryv:domain');

  if (! username || ! password) {
    return res.status(400).send('Please provide your username and password');
  }

  var params = {
    'username': username,
    'password': password,
    'domain': domain
  };

  backup.signInToPryv(params, function(err, connection) {
    if(err) {
      // Trick to return a user readable error in case of host not found
      if(err.indexOf && err.indexOf('ENOTFOUND') !== -1) {
        err = 'Username not found';
      }
      return res.status(400).send(err);
    }

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
