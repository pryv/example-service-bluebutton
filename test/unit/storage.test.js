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

    it('should save the user\'s token', function (done) {
        async.series([
            function saveToken(stepDone) {
                db.save(credentials.username, {token: dummyToken});
                stepDone();
            },
            function verifySaved(stepDone) {
                should.exists(db.infos(credentials.username));
                should.equal(db.infos(credentials.username).token, dummyToken);
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
                console.log(dbPath);
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
                db.save(credentials.username, {trash: "blabla"});
                stepDone();
            },
            function deleteInfo(stepDone) {
                db.delete(credentials.username);
                stepDone();
            },
            function verifyDeleted(stepDone) {
                should.equal(fs.readFileSync(dbPath + '/infos.json', 'utf-8'), "{}");
                should.equal(JSON.stringify(require(dbPath + '/infos.json')), "{}");
                should.not.exists(db.infos(credentials.username));
                stepDone();
            }
        ], done);
    });

    // TODO: Add log tests
});