/*global describe, it*/

var should = require('should'),
    async = require('async');

var storage = require('../../src/storage/password'),
    config = require('../config');

describe('Storage', function () {

  var credentials = config.get('testUser');

  before(function (done) {
    // TODO
    //storage.reset(done);
  });

  it('should save the user\'s password', function (done) {

    async.series([
      function savePassword(stepDone) {
        storage.setPassword(credentials, function (err, res) {
          if (err) {
            return stepDone(err);
          }
          res.should.eql('OK');
          stepDone()
        });
      },
      function verifySaved(stepDone) {
        storage.getPassword(credentials.username, function (err, res) {
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