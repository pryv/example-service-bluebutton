/* global describe, it */

var should = require('should'),
    async = require('async'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    rmdir = require('rmdir'),
    path = require('path'),
    crypto = require('crypto');

var db = require('../../src/storage/db'),
    config = require('../../src/config');


describe('Storage', function () {
    var credentials = require('../data/testUser.json');
    var dbPath = config.get('db:path') + credentials.username;
    var dummyToken = 'iamadummytoken';

    it('should load the user\'s info', function (done) {
        var userInfo = {info: "blabla"};
        var json = JSON.stringify(userInfo);

        async.series([
            function createInfo(stepDone) {
                mkdirp.sync(dbPath);
                fs.writeFileSync(dbPath + '/infos.json', json);
                should.equal(fs.readFileSync(dbPath + '/infos.json', 'utf-8'), json);
                stepDone();
            },
            function loadInfo(stepDone) {
                db.load();
                stepDone();
            },
            function verifyLoaded(stepDone) {
                should.exists(db.infos(credentials.username));
                should.equal(db.infos(credentials.username).info, userInfo.info);
                stepDone();
            },
            function clean(stepDone) {
                rmdir(dbPath, stepDone);
            }
        ], done);
    });

    it('should save the user\'s token and update it', function (done) {
        async.series([
            function saveToken(stepDone) {
                db.save(credentials.username, 'token', dummyToken);
                stepDone();
            },
            function verifySaved(stepDone) {
                should.exists(db.infos(credentials.username));
                should.equal(db.infos(credentials.username).token, dummyToken);
                stepDone();
            },
            function updateToken(stepDone) {
                db.save(credentials.username, 'token', dummyToken + 'updated');
                stepDone();
            },
            function verifyUpdated(stepDone) {
                should.exists(db.infos(credentials.username));
                should.equal(db.infos(credentials.username).token, dummyToken + 'updated');
                stepDone();
            },
            function clean(stepDone) {
                rmdir(dbPath, stepDone);
            }
        ], done);
    });

    it('should watch/unwatch the log file of provided user', function (done) {
        var message = 'coucou';

        db.watchLog(credentials.username, function (log, end) {
            should.equal(log, message + '\n');
            if (end) {
                db.unwatchLog(credentials.username);
                rmdir(dbPath, done);
            }
        });
        db.appendLog(credentials.username, message, true);
    });

    it('should append the log file of provided user with info message', function (done) {
        var message = 'info';

        async.series([
            function createLog(stepDone) {
                mkdirp.sync(dbPath);
                fs.open(dbPath + '/log.json', 'w+', stepDone);
            },
            function appendLog(stepDone) {
                db.appendLog(credentials.username, message);
                stepDone();
            },
            function testLog(stepDone) {
                should.equal(db.log(credentials.username), message + '\n');
                stepDone();
            },
            function clean(stepDone) {
                rmdir(dbPath, stepDone);
            }
        ], done);
    });

    it('should create a zip file and delete all the user\'s info on db', function (done) {
        var downloadPath = config.get('db:download');
        var backupDir = db.backupDir(credentials.username);
        var zipFile = crypto.createHash('md5').update(dummyToken).digest('hex') + '.zip';

        async.series([
            function saveToken(stepDone) {
                db.save(credentials.username, 'token', dummyToken);
                stepDone();
            },
            function createBackup(stepDone) {
                backupDir.createDirs(stepDone);
            },
            function createZip(stepDone) {
                db.createZip(credentials.username, credentials.password, stepDone);
            },
            function deleteInfo(stepDone) {
                db.deleteBackup(credentials.username, stepDone);
            },
            function verifyDeleted(stepDone) {
                should.equal(fs.existsSync(downloadPath + zipFile), false);
                should.equal(fs.existsSync(dbPath), false);
                should.equal(fs.existsSync(backupDir.baseDir), false);
                should.not.exists(db.infos(credentials.username));
                stepDone();
            }
        ], done);
    });
});