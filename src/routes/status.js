var express = require('express');
var router = express.Router();

router.get('/:key', function (req, res, next) {
  res.writeHead(200, { 'Content-Type': 'application/octet-stream',
  'Content-Type': 'text/html; charset=utf-8',
  'Transfer-Encoding': 'chunked'
  });

  var i = 0;
  function tick() {
    res.write('\n: ' + req.params.key + i++);
    if (i > 100) {
      res.end();
    }  else {
      setTimeout(tick, 1000);
    }
  }
  setTimeout(tick, 1000);

  req.on('close', function(err) {
    i = 10000;
  });

});

module.exports = router;