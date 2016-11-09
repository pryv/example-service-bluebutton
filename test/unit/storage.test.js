/*global describe, it*/

var should = require('should'),
    async = require('async'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    config = require('../../src/config');

var db = require('../../src/storage/db');

describe('Storage', function () {

    var credentials = require('../data/testUser.json');
    var dummyToken = 'iamadummytoken';

    it('should save the user\'s token', function (done) {
        async.series([
            function saveToken(stepDone) {
                db.save(credentials.username, {"token": dummyToken});
                stepDone()
            },
            function verifySaved(stepDone) {
                db.infos(credentials.username).token.should.eql(dummyToken);
                stepDone();
            },
            function clean(stepDone) {
                db.delete(credentials.username);
                stepDone();
            }
        ], done);
    });

    it('should load the user\' info', function (done) {

        var path = config.get('db:path') + credentials.username;
        var userInfo = {"info": "blabla"};

        async.series([
            function createInfo(stepDone) {
                mkdirp(path);
                fs.writeFileSync(path + '/infos.json', JSON.stringify(userInfo));
                stepDone()
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

        var path = config.get('db:path') + credentials.username;

        async.series([
            function saveInfo(stepDone) {
                db.save(credentials.username, {"trash": "blabla"});
                stepDone()
            },
            function deleteInfo(stepDone) {
                db.delete(credentials.username);
                stepDone();
            },
            function verifyDeleted(stepDone) {
                should.equal(JSON.stringify(require(path + '/infos.json')), "{}");
                should.not.exists(db.infos(credentials.username));
                stepDone();
            }
        ], done);
    });

});