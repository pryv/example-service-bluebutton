/*global describe, it*/

var should = require('should'),
    async = require('async');

var password = require('../../src/storage/password');

describe('Storage', function () {

  var credentials = require('../data/testUser.json');

  before(function (done) {
    password.reset(done);
  });

  it('should save the user\'s password', function (done) {

    async.series([
      function savePassword(stepDone) {
        password.set(credentials, function (err, res) {
          if (err) {
            return stepDone(err);
          }
          res.should.eql('OK');
          stepDone()
        });
      },
      function verifySaved(stepDone) {
        password.get(credentials.username, function (err, res) {
          if (err) {
            return stepDone(err);
          }
          res.should.eql(credentials.password);
          stepDone();
        })
      }
    ], done);

  })

});