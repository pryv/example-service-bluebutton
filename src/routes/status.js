var express = require('express'),
    router = express.Router();

var db = require('../storage/db');

router.post('/', function (req, res, next) {
  var body = req.body,
      username = body.username;

  if(db.infos(username).token === body.token) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream',
      'Content-Type': 'text/html; charset=utf-8',
      'Transfer-Encoding': 'chunked'
    });

    db.watchLog(username, function(change) {
      if(change) {
        res.write(change);
      } else {
        db.unwatchLog(username);
        res.end();
      }
    });
  } else {
    res.end('Invalid credentials!');
  }
});

module.exports = router;