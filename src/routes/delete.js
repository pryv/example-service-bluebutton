var express = require('express'),
    router = express.Router(),
    db = require('../../src/storage/db');

router.post('/', function (req, res) {
    var body = req.body,
        username = body.username;
    if(db.infos(username) && db.infos(username).token === body.token) {
        db.deleteBackup(username, function(err) {
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