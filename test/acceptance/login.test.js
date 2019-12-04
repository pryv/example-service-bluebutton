/*global before, describe, it*/

const request = require('superagent');
const should = require('should');
const config = require('../../src/config');
const db = require('../../src/storage/db');
const testUser = require('../data/testUser.json');
const fs = require('fs');
const path = require('path');
const superagent = require('superagent');
const parseDomain = require('parse-domain');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

const serviceInfoUrl = config.get('pryv:serviceInfoUrl');
let domain = null;

var validCredentials = {
  username: testUser.username,
  password: testUser.password,
  domain : null
};

var invalidCredentials = {
  username: testUser.username,
  password: 'blabla',
  domain: null
};

require('../../src/server');

describe('Backup', function () {
  before(async () => {
    const serviceInfoRes = await superagent.get(serviceInfoUrl);
    const apiUrl = serviceInfoRes.body.api.replace('{username}', 'testuser');

    const parsedDomain = parseDomain(apiUrl);
    domain = parsedDomain.domain + '.' + parsedDomain.tld;

    validCredentials.domain = domain;
    invalidCredentials.domain = domain;
  });

  it('should backup all data in a zip when credentials are valid', function (done) {
    db.watchLog(testUser.username, domain, function(message, end) {
      if(end) {
        db.unwatchLog(testUser.username, domain);
        var endString = 'Backup file: ';
        should.equal((message.indexOf(endString) > -1), true);
        var zip = message.replace(endString, '').replace('\n','');
        var zipPath = path.normalize(config.get('db:download') + '/' +zip);
        should.equal(fs.existsSync(zipPath), true);
        db.deleteBackup(testUser.username, domain, done);
      }
    });
    request.post(serverBasePath + '/login').send(validCredentials).set('Content-type','application/json').end(function (err, res) {
      should.not.exists(err);
      res.status.should.eql(200);
      should.exists(db.infos(testUser.username, domain).token);
    });
  });

  it('should not backup data when credentials are invalid but throw an error', function (done) {
    request.post(serverBasePath + '/login').send(invalidCredentials).set('Content-type','application/json').end(function (err, res) {
      should.exists(err);
      res.status.should.not.eql(200);
      should.not.exists(db.infos(testUser.username, domain));
      done();
    });
  });
});