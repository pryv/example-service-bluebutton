var express = require('express'),
    router = express.Router(),
    config = require('../config'),
    db = require('../../src/storage/db'),
    backup = require('backup-node'),
    BackupDirectory = backup.Directory,
    fs = require('fs');

router.post('/', function (req, res, next) {
    var body = req.body,
        username = body.username,
        token = body.token;
    if(db.infos(username) && db.infos(username).token === token) {
        // TODO: get it from login?
        var backupDir = new BackupDirectory(username, config.get('pryv:domain'));
        if(fs.existsSync(backupDir)) {
            // TODO: append hostname for valid download link?
            res.download(backupDir);
        } else {
            res.status(400).send('Inexisting backup file!');
        }
    } else {
        res.status(400).send('Invalid credentials!');
    }
});

module.exports = router;