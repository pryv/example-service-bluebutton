var express = require('express'),
    router = express.Router(),
    pryv = require('pryv'),
    db = require('../storage/db'),
    util = require('util'),
    backup = require('backup-node'),
    BackupDirectory = backup.Directory,
    config = require('../config');

// TODO: What if multiple parallel backups?
var token = null,
    username = null;

router.post('/', function (req, res, next) {

  var body = req.body,
      password = body.password;
  username = body.username;

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

  backup.signInToPryv(params, function(err, connection) {
    if(err) {
      return res.status(400).send(err);
    }

    // Save token
    token = connection.auth;
    db.save(connection.username, {"token": token});

    var infos = db.infos(username);

    if(infos.status === 'running') {
      // TODO: not same instance => not same token?
      res.status(200).send(token);
    } else if (infos.status === 'complete') {
      // TODO: provide link
    } else {
      res.status(200).send(token);
      // Start backup
      params.includeTrashed = body.includeTrashed;
      params.includeAttachments = body.includeAttachments;
      params.backupDirectory = new BackupDirectory(username, params.domain);
      db.resetLog(username);
      backup.startOnConnection(connection, params, backupComplete, log);
      infos.status = 'running';
      db.save(username, infos);
    }
  });
});

var log = function(message) {
  db.appendLog(username, message);
};

var backupComplete = function(err) {
  if(err) {
    return db.appendLog(username, err);
  }
  db.appendLog(username, 'Backup completed!');
  var infos = db.infos(username);
  infos.status = 'complete';
  db.save(username, infos);
};

module.exports = router;
