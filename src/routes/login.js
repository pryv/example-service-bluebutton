var express = require('express'),
    router = express.Router(),
    pryv = require('pryv'),
    db = require('../storage/db'),
    util = require('util'),
    backup = require('backup-node'),
    BackupDirectory = backup.Directory,
    config = require('../config'),
    zip = require('zip-folder'),
    crypto = require('crypto'),
    fs = require('fs');


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

    if(!db.infos(username).running) {
      // Start backup
      var params = {
        "backupDirectory" : backupDir,
        "includeAttachments" : body.includeAttachments,
        "includeTrashed" : body.includeTrashed
      };
      backup.startOnConnection(connection, params, backupComplete, log);
      db.save(username, 'running', true);
    }

    res.status(200).send({"token": token, "log": db.log(username)});
  });
});

var log = function(message) {
  db.appendLog(username, message);
};

var backupComplete = function(err) {
  if(err) {
    return db.appendLog(username, err, true);
  }
  var hash = crypto.createHash('md5').update(token).digest("hex");
  var path = __dirname + '/../../download';
  var file = hash + '.zip';
  if (!fs.existsSync(path)){
    fs.mkdirSync(path);
  }
  zip(backupDir.baseDir, path + '/' + file, function(err) {
    if(err) {
      db.appendLog(username, 'Zip creation error', true);
    }
    db.appendLog(username, 'Backup completed!');
    db.appendLog(username, 'Backup file: ' + file, true);
    db.save(username, 'file', file);
  });
};

module.exports = router;
