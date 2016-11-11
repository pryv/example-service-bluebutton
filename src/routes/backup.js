var express = require('express'),
    router = express.Router(),
    backup = require('backup-node'),
    db = require('../storage/db');

var connection = null,
    parameters = null,
    token = null;

router.post('/', function (req, res, next) {
  // TODO: check that backup is not already running

  var body = req.body;
  token = body.token;

  if (!token) {
    backupComplete('Error: missing user token');
  }

  if(!connection) {
    backupComplete('Error: missing connection!');
  }
  if(!parameters) {
    backupComplete('Error: missing connection parameters!');
  }
  parameters.includeTrashed = body.includeTrashed;
  parameters.includeAttachments = body.includeAttachments;
  db.resetLog(token);
  backup.startOnConnection(connection, parameters, backupComplete, log);
});

module.exports.setConnection = function(conn, params) {
  connection = conn;
  parameters = params;
};

var log = function(message) {
  db.appendLog(token, message);
};

var backupComplete = function(err) {
  // TODO: handle backup completion
};

module.exports = router;