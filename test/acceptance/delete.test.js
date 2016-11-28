/*global describe, it, before*/
var request = require('superagent'),
    should = require('should'),
    config = require('../../src/config'),
    db = require('../../src/storage/db'),
    async = require('async');

require('../../src/server');

require('readyness/wait/mocha');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe("Delete", function () {
    var credentials = {
        username: "validuser",
        token : "validtoken"
    };

    it('should be successful when trying to delete user backup with valid credentials', function (done) {
        async.series([
            function saveToken(stepDone) {
                db.save(credentials.username, 'token', credentials.token);
                should.exists(db.infos(credentials.username));
                should.exists(db.infos(credentials.username).token);
                stepDone();
            },
            function deleteRequest(stepDone) {
                request.post(serverBasePath + '/delete').send(credentials).set('Content-type','application/json').end(function (err, res) {
                    should.not.exists(err);
                    res.status.should.eql(200);
                    stepDone();
                });
            }
        ], done);
    });

    it('should send an error when trying to delete user backup with invalid credentials', function (done) {
        request.post(serverBasePath + '/delete').send(credentials).set('Content-type','application/json').end(function (err, res) {
            should.exists(err);
            res.status.should.not.eql(200);
            done();
        });
    });

});