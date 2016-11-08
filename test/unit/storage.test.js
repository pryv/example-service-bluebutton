/*global describe, it*/

var should = require('should'),
    async = require('async');

var db = require('../../src/storage/db');

describe('Storage', function () {

  var credentials = require('../data/testUser.json');
  var dummyToken = 'iamadummytoken'

  before(function (done) {
    done();
  });

  it('should save the user\'s token', function (done) {

    async.series([
      function saveToken(stepDone) {
      db.save(credentials.username, {"token": dummyToken});
        stepDone();
      },
      function verifySaved(stepDone) {
        db.infos(credentials.username).token.should.eql(dummyToken);
        stepDone();
      }
    ], done);

  });

  // TODO: test load
});