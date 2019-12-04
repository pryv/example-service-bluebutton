var express = require('express'),
    router = express.Router();

var db = require('../storage/db'),
    config = require('../config');

router.post('/', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/octet-stream',
    'Transfer-Encoding': 'chunked'
  });

  var body = req.body,
      username = body.username,
      domain = config.get('pryv:domain');

  if(db.infos(username, domain).token === body.token) {
    db.watchLog(username, domain, function(log, end) {
      res.write(log);
      if(end) {
        db.unwatchLog(username, domain);
        res.end('END');
      }
    });
  } else {
    res.end('Invalid credentials!');
  }
});

module.exports = router;