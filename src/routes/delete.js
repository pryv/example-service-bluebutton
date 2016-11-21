var express = require('express'),
    router = express.Router(),
    config = require('../config'),
    db = require('../../src/storage/db'),
  backup = require('backup-node'),
  fs = require('fs'),
  BackupDirectory = backup.Directory;

router.post('/', function (req, res, next) {
    var body = req.body,
        username = body.username;
    if(db.infos(username) && db.infos(username).token === body.token) {
        new BackupDirectory(username, config.get('pryv:domain')).deleteDirs(function(err) {
            if(err) {
                res.status(500).send('Backup deletion error!');
            } else {
                // TODO set path in db
                var path = __dirname + '/../../download/';
                fs.unlinkSync(path + db.infos(username).file);
                db.delete(username, function (err) {
                    if(err) {
                        return res.status(500).send('User info deletion error!');
                    }
                    res.status(200).send('Backup deleted');

                });
            }
        });
    } else {
        res.status(400).send('Invalid credentials!');
    }
});

module.exports = router;