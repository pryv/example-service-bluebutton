/*global before, describe, it*/

const request = require('superagent');
const should = require('should');
const config = require('../../src/config');
const db = require('../../src/storage/db');
const testUser = require('../data/testUser.json');
const fs = require('fs');
const path = require('path');
const superagent = require('superagent');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

const serviceInfoUrl = config.get('pryv:serviceInfoUrl');

var validCredentials = {
  username: testUser.username,
  password: testUser.password,
  serviceInfoUrl : serviceInfoUrl
};

var invalidCredentials = {
  username: testUser.username,
  password: 'blabla',
  serviceInfoUrl : serviceInfoUrl
};

require('../../src/server');

describe('Backup', function () {
  this.timeout(5000);

  before(async () => {
    const serviceInfoRes = await superagent.get(serviceInfoUrl);
    testUser.apiEndpoint = serviceInfoRes.body.api.replace('{username}', testUser.username);
  });

  it('should backup all data in a zip when credentials are valid', function (done) {
    
    db.watchLog(testUser.apiEndpoint, function(message, end) {
      if(end) {
        db.unwatchLog(testUser.apiEndpoint);
        var endString = 'Backup file: ';
        should.equal((message.indexOf(endString) > -1), true);
        var zip = message.replace(endString, '').replace('\n','');
        var zipPath = path.normalize(config.get('db:download') + '/' +zip);
        should.equal(fs.existsSync(zipPath), true);
        db.deleteBackup(testUser.apiEndpoint, done);
      }
    });
    
    request.post(serverBasePath + '/login').send(validCredentials).set('Content-type','application/json').end(function (err, res) {
      should.not.exists(err);
      res.status.should.eql(200);
      should.exists(db.infos(res.body.apiEndpoint).apiEndpoint);
      should.equal(db.infos(res.body.apiEndpoint).apiEndpoint, res.body.apiEndpoint);
    });
  });

  it('should not backup data when credentials are invalid but throw an error', function (done) {
    request.post(serverBasePath + '/login').send(invalidCredentials).set('Content-type','application/json').end(function (err, res) {
      should.exists(err);
      res.status.should.not.eql(200);
      should.not.exists(db.infos(testUser.apiEndpoint));
      done();
    });
  });
});