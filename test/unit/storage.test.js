/*global describe, it*/

var should = require('should'),
    async = require('async'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    config = require('../../src/config');

var db = require('../../src/storage/db');

describe('Storage', function () {

    var credentials = require('../data/testUser.json');
    var dbPath = config.get('db:path') + credentials.username;
    var dummyToken = 'iamadummytoken';

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
                db.save(credentials.username, 'token', dummyToken + 1);
                stepDone();
            },
            function verifyUpdated(stepDone) {
                should.exists(db.infos(credentials.username));
                should.equal(db.infos(credentials.username).token, dummyToken + 1);
                stepDone();
            },
            function clean(stepDone) {
                db.delete(credentials.username);
                stepDone();
            }
        ], done);
    });

    it('should load the user\'s info', function (done) {

        var userInfo = {info: "blabla"};
        var json = JSON.stringify(userInfo);

        async.series([
            function createInfo(stepDone) {
                mkdirp(dbPath);
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
                db.delete(credentials.username);
                stepDone();
            }
        ], done);
    });

    it('should delete the user\'s info', function (done) {
        async.series([
            function saveInfo(stepDone) {
                db.save(credentials.username, 'trash', "blabla");
                stepDone();
            },
            function deleteInfo(stepDone) {
                db.delete(credentials.username, stepDone);
            },
            function verifyDeleted(stepDone) {
                should.equal(fs.existsSync(dbPath + credentials.username), false);
                should.not.exists(db.infos(credentials.username));
                stepDone();
            }
        ], done);
    });

    it('should append the log file for the specified user and return its content', function (done) {
        var message = 'coucou';
        async.series([
            function appendLog(stepDone) {
                db.appendLog(credentials.username, message);
                stepDone();
            },
            function verifyAppended(stepDone) {
                should.equal(db.log(credentials.username), message + '\n');
                stepDone();
            },
            function clean(stepDone) {
                db.delete(credentials.username, stepDone);
            }
        ], done);
    });

    it('should watch and unwatch the log file for the specified user', function (done) {
        var newLine = 'newline',
            endLine = 'Backup completed!',
            res = null;

        async.series([
            function setupWatch(stepDone) {
                db.watchLog(credentials.username, function(change) {
                    res = change;
                });
                stepDone();
            },
            function logNewLine(stepDone) {
                db.appendLog(credentials.username, newLine);
                var lastLine = db.log(credentials.username).split('\n').slice(-1)[0];
                should.equal(res, lastLine);
                stepDone();
            },
            function logEndLine(stepDone) {
                db.appendLog(credentials.username, endLine);
                should.not.exists(res);
                stepDone();
            },
            function clean(stepDone) {
                db.delete(credentials.username, stepDone);
            }
        ], done);
    });

});