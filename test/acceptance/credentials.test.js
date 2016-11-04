/*global describe, it, before*/
var request = require('superagent'),
    config = require('../config');w

require('../../src/server');

require('readyness/wait/mocha');

var should = require('should');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port'),
  domain = config.get('pryv:domain'),
  appId = config.get('pryv:appId');

describe("Credentials", function () {

  it('should accept valid credentials and cache it', function (done) {
    request.post(serverBasePath + '/login').send({
      username: config.get('testUser:username'),
      password: config.get('testUser:password'),
      email: config.get('testUser:email')
    }).set('Content-type','application/json').end(function (err, res) {
      if (err) {
        return done(err);
      }
      res.status.should.eql(200);
      storage.
      done();
    })
  });

  it('should reply with an error when credentials are invalid', function () {

  });

});