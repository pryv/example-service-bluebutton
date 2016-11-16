var express = require('express'),
    router = express.Router();

var db = require('../storage/db');

router.post('/', function (req, res, next) {
  res.writeHead(200, { 'Content-Type': 'application/octet-stream',
    'Content-Type': 'text/html; charset=utf-8',
    'Transfer-Encoding': 'chunked'
  });

  function tick() {
    var body = req.body,
        username = body.username;
    if(db.infos(username).token === body.token) {
      res.write(db.log(username));
    } else {
      res.write('Invalid credentials!');
    }
  }

  // TODO: update only when changes
  setTimeout(tick, 1000);

  // TODO: complete with res.end, req.on close

});

module.exports = router;