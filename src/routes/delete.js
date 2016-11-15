var express = require('express'),
    router = express.Router(),
    config = require('../config'),
    BackupDirectory = require('backup-node').Directory;

router.post('/', function (req, res, next) {
    var body = req.body,
        username = body.username;
    if(db.infos(username).token === body.token) {
        new BackupDirectory(username, config.get('pryv:domain')).deleteDirs(function(err) {
            if(err) {
                res.status(400).send(err);
            } else {
                res.status(200).send('Backup deleted');
            }
        });
    } else {
        res.status(400).send('Invalid credentials!');
    }
});

module.exports = router;