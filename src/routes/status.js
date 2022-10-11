var express = require('express'),
    router = express.Router();

var db = require('../storage/db'),
    config = require('../config');

router.post('/', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/octet-stream',
    'Transfer-Encoding': 'chunked'
  });
  const apiEndpoint = req.body?.apiEndpoint;


  if(db.infos(apiEndpoint).apiEndpoint === apiEndpoint) {
    db.watchLog(apiEndpoint, function(log, end) {
      res.write(log);
      if(end) {
        db.unwatchLog(apiEndpoint);
        res.end('END');
      }
    });
  } else {
    res.end('Invalid credentials!');
  }
});

module.exports = router;