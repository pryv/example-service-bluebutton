var express = require('express');
var router = express.Router(),
    pryv = require('pryv'),
    db = require('../storage/db'),
    util = require('util'),
    backup = require('backup-node'),
    config = require('../config');

router.post('/', function (req, res, next) {

  var body = req.body;
  if (! body.username || body.username.length <= 4) {
    return next('Error: invalid username');
  }
  if(! body.password || body.password.length <= 6) {
    return next('Error: invalid password');
  }

  var params = {
    "username": body.username,
    "password": body.password,
    "domain": config.get('pryv:domain')
  };

  backup.signInToPryv(params, function(err, connection) {
    if(err) {
      // TODO: redirect error from app-backup/pryv-connection?
      return res.status(400).send("Login error:\n" , util.inspect(err));
    }

    // Save token
    db.save(connection.username, {"token": connection.auth});
    res.status(200).send("Successfully Logged in...");
    
  });
});

module.exports = router;
