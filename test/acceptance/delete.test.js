/*global describe, it, before*/
var request = require('superagent'),
    should = require('should'),
    config = require('../../src/config'),
    db = require('../../src/storage/db'),
    BackupDirectory = require('backup-node').Directory,
    async = require('async'),
    fs = require('fs');

require('../../src/server');

require('readyness/wait/mocha');

var serverBasePath = 'https://' + config.get('http:hostname') + ':' + config.get('http:port');

describe("Delete", function () {

    var credentials = {
        username: "validuser",
        token : "validtoken"
    };

    it('should delete user backup with valid credentials', function (done) {
        var backupDir = null;
        async.series([
            function saveToken(stepDone) {
                db.save(credentials.username, 'token', credentials.token);
                should.exists(db.infos(credentials.username));
                should.exists(db.infos(credentials.username).token);
                stepDone();
            },
            function createBackup(stepDone) {
                backupDir = new BackupDirectory(credentials.username, config.get('pryv:domain'));
                backupDir.createDirs(function(err) {
                    if(err) {
                        return stepDone(err);
                    }
                    should.equal(fs.existsSync(backupDir.baseDir), true);
                    stepDone();
                });
            },
            function deleteRequest(stepDone) {
                request.post(serverBasePath + '/delete').send(credentials).set('Content-type','application/json').end(function (err, res) {
                    should.not.exists(err);
                    res.status.should.eql(200);
                    should.equal(fs.existsSync(backupDir.baseDir), false);
                    db.delete(credentials.username);
                    should.not.exists(db.infos(credentials.username));
                    stepDone();
                });
            }
        ], done);
    });

    it('should delete user backup with valid credentials', function (done) {
        var backupDir = null;
        async.series([
            function createBackup(stepDone) {
                backupDir = new BackupDirectory(credentials.username, config.get('pryv:domain'));
                backupDir.createDirs(function(err) {
                    if(err) {
                        return stepDone(err);
                    }
                    should.equal(fs.existsSync(backupDir.baseDir), true);
                    stepDone();
                });
            },
            function deleteRequest(stepDone) {
                request.post(serverBasePath + '/delete').send(credentials).set('Content-type','application/json').end(function (err, res) {
                    should.not.exists(err);
                    res.status.should.not.eql(200);
                    should.equal(fs.existSync(backupDir.baseDir), true);
                    backupDir(username, config.get('pryv:domain')).deleteDirs(stepDone);
                });
            }
        ], done);
    });

});