var express = require('express'),
    router = express.Router(),
    db = require('../storage/db'),
    config = require('../config'),
    backup = require('backup-node');

router.post('/', function (req, res, next) {

  var body = req.body,
      password = body.password,
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
        "backupDirectory" : db.backupDir(username),
        "includeAttachments" : (body.includeAttachments != 0),
        "includeTrashed" : (body.includeTrashed != 0)
      };
      backup.startOnConnection(connection, params, backupComplete.bind(this, null, username), function (message) {
        db.appendLog(username, message);
      });
      db.save(username, 'running', true);
    }

    res.status(200).send({"token": token, "log": db.log(username)});
  });
});

var backupComplete = function(err, username) {
  if(err) {
    db.appendLog(username, err, true);
    return db.deleteBackup(username, function(err) {
      // TODO: check this case
    });
  }
  db.createZip(username);
};

module.exports = router;
