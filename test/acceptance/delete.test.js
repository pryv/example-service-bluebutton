/*global describe, it, before*/
var request = require('superagent'),
    should = require('should'),
    config = require('../../src/config'),
    db = require('../../src/storage/db'),
    async = require('async');

require('../../src/server');

require('readyness/wait/mocha');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('Delete', function () {
  var domain = 'pryv.me';

  const token = 'validtoken';
  const fullApiEndpoint = 'https://' + token + '@validuser.' + domain;
  const apiEndpoint = 'https://validuser.' + domain;

  it('[ABCD] should be successful when trying to delete user backup with valid credentials', function (done) {
    async.series([
      function saveApiEndpoint(stepDone) {
        db.save(fullApiEndpoint, 'apiEndpoint', fullApiEndpoint);
        should.exists(db.infos(apiEndpoint));
        should.exists(db.infos(apiEndpoint).apiEndpoint);
        stepDone();
      },
      function deleteRequest(stepDone) {
        request.post(serverBasePath + '/delete').send({apiEndpoint: fullApiEndpoint}).set('Content-type','application/json').end(function (err, res) {
          should.not.exists(err);
          res.status.should.eql(200);
          stepDone();
        });
      }
    ], done);
  });

  it('[EFGH] should send an error when trying to delete user backup with invalid credentials', function (done) {
    request.post(serverBasePath + '/delete').send({apiEndpoint: 'https://invalid@validuser.' + domain}).set('Content-type','application/json').end(function (err, res) {
      should.exists(err);
      res.status.should.not.eql(200);
      done();
    });
  });

});