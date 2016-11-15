/*global describe, it, before*/
var request = require('superagent'),
    should = require('should'),
    config = require('../../src/config'),
    db = require('../../src/storage/db'),
    testUser = require('../data/testUser.json');

require('../../src/server');

require('readyness/wait/mocha');

var serverBasePath = 'https://' + config.get('http:hostname') + ':' + config.get('http:port');

describe("Credentials", function () {

  /* TODO: Test also backup since login success launches backup
  it('should connect with valid credentials and save the resulting token', function (done) {
    var validCredentials = {
      username: testUser.username,
      password: testUser.password
    };

    request.post(serverBasePath + '/login').send(validCredentials).set('Content-type','application/json').end(function (err, res) {
      if (err) {
        return done(err);
      }
      res.status.should.eql(200);
      should.exists(db.infos(validCredentials.username).token);
      db.delete(testUser.username);
      done();
    });
  });
  */

  it('should reply with an error when credentials are invalid', function (done) {
    var invalidCredentials = {
      username: testUser.username,
      password: "blabla"
    }

    request.post(serverBasePath + '/login').send(invalidCredentials).set('Content-type','application/json').end(function (err, res) {
      should.exists(err);
      res.status.should.not.eql(200);
      should.not.exists(db.infos(invalidCredentials.username));
      done();
    });
  });

});