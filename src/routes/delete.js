var express = require('express'),
    router = express.Router(),
    db = require('../../src/storage/db'),
    config = require('../config');

router.post('/', function (req, res) {
    var body = req.body,
        username = body.username,
        domain = body.domain || config.get('pryv:domain');

    if(db.infos(username, domain) && db.infos(username, domain).token === body.token) {
        db.deleteBackup(username, domain, function(err) {
            if(err) {
                return res.status(500).send(err);
            }
            return res.status(200).send('Backup deleted!');
        });
    } else {
        res.status(400).send('Invalid credentials!');
    }
});

module.exports = router;