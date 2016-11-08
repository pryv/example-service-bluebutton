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

  before(function (done) {
    password.reset(done);
  });

  it('should accept valid credentials and cache it', function (done) {
    var validCredentials = {
      username: testUser.username,
      password: testUser.password
    };

    console.log('creds', validCredentials)
    console.log('ending to', serverBasePath)

    request.post(serverBasePath + '/login').send(validCredentials).set('Content-type','application/json').end(function (err, res) {
      if (err) {
        console.log('is it here')
        return done(err);
      }
      res.status.should.eql(200);
      should.exists(db.infos(validCredentials.username).token);
    })
  });

  it('should reply with an error when credentials are invalid', function () {

  });

});