var express = require('express');
var router = express.Router(),
    password = require('../storage/password');

router.post('/', function (req, res, next) {

  var body = req.body;
  if (! body.username || body.username.length <= 5) {
    return next('Error: invalid username');
  }
  if(! body.password || body.password.length <= 6) {
    return next('Error: invalid password');
  }
  if(! body.email || body.email.length <= 3) {
    return next('Error: invalid email');
  }

  password.set(body);
  res.send('OK');
});

module.exports = router;
