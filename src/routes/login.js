var express = require('express'),
    router = express.Router(),
    pryv = require('pryv'),
    db = require('../storage/db'),
    util = require('util'),
    backup = require('backup-node'),
    BackupDirectory = backup.Directory,
    config = require('../config'),
    zip = require('zip-folder');

// TODO: What if multiple parallel backups?
var token = null,
    username = null,
    backupDir = null;

router.post('/', function (req, res, next) {

  var body = req.body,
      password = body.password;

  username = body.username;

  // TODO: figure out this next() and do the same for other routes
  if (! username || username.length <= 4) {
    return next('Error: invalid username');
  }
  if(! password || password.length <= 6) {
    return next('Error: invalid password');
  }

  var params = {
    "username": username,
    "password": password,
    "domain": config.get('pryv:domain')
  };

  backupDir = new BackupDirectory(username, params.domain);

  backup.signInToPryv(params, function(err, connection) {
    if(err) {
      return res.status(400).send(err);
    }

    // Save token
    token = connection.auth;
    db.save(connection.username, 'token', token);

    if(db.infos(username).idle) {
      // Start backup
      params.includeTrashed = body.includeTrashed;
      params.includeAttachments = body.includeAttachments;
      params.backupDirectory = backupDir;
      db.resetLog(username);
      backup.startOnConnection(connection, params, backupComplete, log);
      db.save(username, 'idle', false);
    }

    res.status(200).send(token);
  });
});

var log = function(message) {
  db.appendLog(username, message);
};

// TODO: use streams for log in db and close stream when error or complete
var backupComplete = function(err) {
  if(err) {
    return db.appendLog(username, err);
  }
  var name = backupDir + token + '.zip';
  zip(backupDir, name, function(err) {
    if(err) {
      db.appendLog(username, 'Zip creation error');
    }
    db.appendLog(username, 'Backup completed!');
    db.save(username, 'idle', 'true');
  });
};

module.exports = router;
