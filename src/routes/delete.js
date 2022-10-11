var express = require('express'),
    router = express.Router(),
    pryv = require('pryv');
    db = require('../../src/storage/db');

router.post('/',  function (req, res) {
    var body = req.body,
      apiEndpoint = body.apiEndpoint;

    if(db.infos(apiEndpoint) && db.infos(apiEndpoint).apiEndpoint === apiEndpoint) {
        db.deleteBackup(apiEndpoint, function(err) {
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