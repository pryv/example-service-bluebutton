var express = require('express');
var router = express.Router(),
    password = require('../storage/password'),
    pryv = require('pryv'),
    util = require('util');

router.post('/', function (req, res, next) {

  var body = req.body;
  if (! body.username || body.username.length <= 4) {
    return next('Error: invalid username');
  }
  if(! body.password || body.password.length <= 6) {
    return next('Error: invalid password');
  }

  // TODO: Use app-node-backup functions (need to be modularized)
  var params = {
    appId: 'pryv-service-backup',
    username: body.username,
    password: body.password,
    port: 443,
    ssl: true,
    domain: 'pryv.me'
  };

  params.origin = 'https://sw.' + params.domain;

  pryv.Connection.login(params, function (err, conn) {
    if (err) {
      return res.send('Connection failed with Error:', util.inspect(err));
    }

    // TODO: save token
    var connection = conn;
    res.send('Successfully Logged in...');
  });
});

module.exports = router;
