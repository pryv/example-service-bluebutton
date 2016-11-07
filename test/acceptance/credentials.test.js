/*global describe, it, before*/
var request = require('superagent'),
    should = require('should'),
    config = require('../../src/config'),
    password = require('../../src/storage/password'),
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
      password: testUser.password,
      email: testUser.email
    };

    console.log('creds', validCredentials)
    console.log('ending to', serverBasePath)

    request.post(serverBasePath + '/login').send(validCredentials).set('Content-type','application/json').end(function (err, res) {
      if (err) {
        console.log('is it here')
        return done(err);
      }
      res.status.should.eql(200);
      password.get(validCredentials.username, function (err, res) {
        console.log('found in redis:', res);
        console.log('expected pw:');
        (validCredentials.password).should.eql(res);
        done();
      });
    })
  });

  it('should reply with an error when credentials are invalid', function () {

  });

});