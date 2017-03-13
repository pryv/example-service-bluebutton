/*global describe, it*/
var request = require('superagent'),
    should = require('should'),
    config = require('../../src/config'),
    db = require('../../src/storage/db');

require('../../src/server');

require('readyness/wait/mocha');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('Delete', function () {
  var credentials = {
    username: 'validuser',
    token : 'validtoken'
  };

  it('should be successful when trying to delete user backup with valid credentials', function () {
    return Promise.all([
      new Promise((resolve) => {
        db.save(credentials.username, 'token', credentials.token);
        should.exists(db.infos(credentials.username));
        should.exists(db.infos(credentials.username).token);
        resolve();
      }),
      request.post(serverBasePath + '/delete').send(credentials).set('Content-type','application/json').then((res) => {
        should.not.exists(db.infos(credentials.username));
        res.status.should.eql(200);
        res.text.should.eql('Backup deleted!');
      })
    ]);
  });

  it('should send an error when trying to delete user backup with invalid credentials', function () {
    return request.post(serverBasePath + '/delete').send(credentials).set('Content-type','application/json').catch((err) => {
      err.status.should.eql(400);
      err.response.text.should.eql('Invalid credentials!');
    });
  });

});