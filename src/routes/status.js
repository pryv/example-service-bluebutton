var express = require('express'),
    router = express.Router();

var db = require('../storage/db');

router.post('/', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/octet-stream',
    'Transfer-Encoding': 'chunked'
  });

  var body = req.body,
      username = body.username;

  if(db.infos(username).token === body.token) {
    db.watchLog(username, function(log, end) {
      res.write(log);
      if(end) {
        db.unwatchLog(username);
        res.end('END');
      }
    });
  } else {
    res.end('Invalid credentials!');
  }
});

module.exports = router;