var express = require('express'),
    router = express.Router(),
    db = require('../storage/db'),
    config = require('../config'),
    backup = require('backup-node'),
    _ = require('lodash');

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
    'username': username,
    'password': password,
    'domain': config.get('pryv:domain')
  };

  backup.signInToPryv(params, function(err, connection) {
    if(err) {
      return res.status(400).send(err);
    }

    // Save token
    var token = connection.auth;
    db.save(connection.username, 'token', token);

    if(!db.infos(username).running) {
      // Start backup
      var params = {
        'backupDirectory' : db.backupDir(username),
        /* jshint ignore:start */
        'includeAttachments' : (body.includeAttachments != 0),
        'includeTrashed' : (body.includeTrashed != 0)
        /* jshint ignore:end */
      };
      backup.startOnConnection(connection, params,
        _.bind(backupComplete, null, _, username),
        _.bind(db.appendLog, null, username));
      db.save(username, 'running', true);
    }

    res.status(200).send({'token': token, 'log': db.log(username)});
  });
});

var backupComplete = function(err, username) {
  if(err) {
    db.appendLog(username, err, true);
    db.deleteBackup(username, function() {
      // TODO: check this case
      return;
    });
  }
  db.createZip(username);
};

module.exports = router;
