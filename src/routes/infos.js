var express = require('express'),
    router = express.Router(),
    pryv = require('pryv');
    db = require('../storage/db');
const config = require('../config');

router.post('/',  function (req, res) {
    const body = req.body;

    let serviceInfoUrl;
    if (!config.get('pryv:enforceDomain') && body.serviceInfoUrl) {
      serviceInfoUrl = body.serviceInfoUrl;
    } else {
      serviceInfoUrl = config.get('pryv:serviceInfoUrl');
    }

    
});

module.exports = router;