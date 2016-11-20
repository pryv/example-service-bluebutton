var express = require('express'),
    router = express.Router();

var db = require('../storage/db');

router.post('/', function (req, res, next) {
  res.writeHead(200, { 'Content-Type': 'application/octet-stream',
    'Content-Type': 'text/html; charset=utf-8',
    'Transfer-Encoding': 'chunked'
  });

  var body = req.body,
      username = body.username;

  // TODO: handle errors and completion
  if(db.infos(username).token === body.token) {
    db.watchLog(username, function(log, end) {
      res.write(log);
      if(end) {
        db.unwatchLog(username);
        res.end();
      }
    });
  } else {
    res.end('Invalid credentials!');
  }
});

module.exports = router;