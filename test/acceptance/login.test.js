/*global describe, it*/

var request = require('superagent'),
    should = require('should'),
    config = require('../../src/config'),
    db = require('../../src/storage/db'),
    testUser = require('../data/testUser.json'),
    fs = require('fs'),
    path = require('path');

var serverBasePath = 'https://' + config.get('http:hostname') + ':' + config.get('http:port');

var validCredentials = {
  username: testUser.username,
  password: testUser.password
};

var invalidCredentials = {
  username: testUser.username,
  password: "blabla"
}

require('../../src/server');

describe('Backup', function () {

  it('should backup all data in a zip when credentials are valid', function (done) {
    request.post(serverBasePath + '/login').send(validCredentials).set('Content-type','application/json').end(function (err, res) {
      should.not.exists(err);
      res.status.should.eql(200);
      should.exists(db.infos(testUser.username).token);
    });
    db.watchLog(testUser.username, function(message, end) {
      if(end) {
        db.unwatchLog(testUser.username);
        var endString = 'Backup file: ';
        should.equal((message.indexOf(endString) > -1), true);
        var zip = message.replace(endString, "").replace('\n',"");
        var zipPath = config.get('db:download') + zip;
        should.equal(fs.existsSync(zipPath), true);
        db.deleteBackup(testUser.username, done);
      }
    });
  });

  it('should not backup data when credentials are invalid but throw an error', function (done) {
    request.post(serverBasePath + '/login').send(invalidCredentials).set('Content-type','application/json').end(function (err, res) {
      should.exists(err);
      res.status.should.not.eql(200);
      should.not.exists(db.infos(testUser.username));
      done();
    });
  });
});