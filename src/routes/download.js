var express = require('express'),
    router = express.Router(),
    config = require('../config'),
    db = require('../../src/storage/db'),
    backup = require('backup-node'),
    BackupDirectory = backup.Directory,
    zip = require('zip-folder');

router.post('/', function (req, res, next) {
    var body = req.body,
        username = body.username,
        token = body.token;
    if(db.infos(username) && db.infos(username).token === token) {
        var directory = new BackupDirectory(username, config.get('pryv:domain'));
        var path = directory + token + '.zip';
        zip(directory, path, function(err) {
            if(err) {
                return res.status(500).send('Zip creation failure!');
            }
            res.download(path);
        });
    } else {
        res.status(400).send('Invalid credentials!');
    }
});

module.exports = router;