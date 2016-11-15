var express = require('express'),
    router = express.Router(),
    config = require('../config'),
    db = require('../../src/storage/db');
    backup = require('backup-node'),
    BackupDirectory = backup.Directory;

router.post('/', function (req, res, next) {
    var body = req.body,
        username = body.username;
    if(db.infos(username) && db.infos(username).token === body.token) {
        new BackupDirectory(username, config.get('pryv:domain')).deleteDirs(function(err) {
            if(err) {
                res.status(500).send('Backup creation error!');
            } else {
                res.status(200).send('Backup deleted');
            }
        });
    } else {
        res.status(400).send('Invalid credentials!');
    }
});

module.exports = router;