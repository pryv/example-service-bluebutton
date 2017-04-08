/* global describe, it */

var should = require('should'),
    async = require('async'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    rmdir = require('rmdir'),
    path = require('path'),
    crypto = require('crypto');

var db = require('../../src/storage/db'),
    config = require('../../src/config');


describe('Storage', function () {
  var credentials = require('../data/testUser.json');
  var domain = config.get('pryv:domain');
  var dbPath = path.normalize(config.get('db:path') + '/' + credentials.username + '.' + domain);
  var dummyToken = 'iamadummytoken';

  it('should load the user\'s info', function (done) {
    var userInfo = {info: 'blabla'};
    var json = JSON.stringify(userInfo);

    async.series([
      function createInfo(stepDone) {
        mkdirp.sync(dbPath);
        var infoPath = path.normalize(dbPath + '/infos.json');
        fs.writeFileSync(infoPath, json);
        should.equal(fs.readFileSync(infoPath, 'utf-8'), json);
        stepDone();
      },
      function loadInfo(stepDone) {
        db.load();
        stepDone();
      },
      function verifyLoaded(stepDone) {
        should.exists(db.infos(credentials.username, domain));
        should.equal(db.infos(credentials.username, domain).info, userInfo.info);
        stepDone();
      },
      function clean(stepDone) {
        rmdir(dbPath, stepDone);
      }
    ], done);
  });

  it('should save the user\'s token and update it', function (done) {
    async.series([
      function saveToken(stepDone) {
        db.save(credentials.username, domain, 'token', dummyToken);
        stepDone();
      },
      function verifySaved(stepDone) {
        should.exists(db.infos(credentials.username, domain));
        should.equal(db.infos(credentials.username, domain).token, dummyToken);
        stepDone();
      },
      function updateToken(stepDone) {
        db.save(credentials.username, domain, 'token', dummyToken + 'updated');
        stepDone();
      },
      function verifyUpdated(stepDone) {
        should.exists(db.infos(credentials.username, domain));
        should.equal(db.infos(credentials.username, domain).token, dummyToken + 'updated');
        stepDone();
      },
      function clean(stepDone) {
        rmdir(dbPath, stepDone);
      }
    ], done);
  });

  it('should watch/unwatch the log file of provided user', function (done) {
    var message = 'coucou';

    db.watchLog(credentials.username, domain, function (log, end) {
      should.equal(log, message + '\n');
      if (end) {
        db.unwatchLog(credentials.username, domain);
        rmdir(dbPath, done);
      }
    });
    db.appendLog(credentials.username, domain, message, true);
  });

  it('should append the log file of provided user with info message', function (done) {
    var message = 'info';

    async.series([
      function createLog(stepDone) {
        mkdirp.sync(dbPath);
        fs.open(path.normalize(dbPath + '/log.json'), 'w+', stepDone);
      },
      function appendLog(stepDone) {
        db.appendLog(credentials.username, domain, message);
        stepDone();
      },
      function testLog(stepDone) {
        should.equal(db.log(credentials.username, domain), message + '\n');
        stepDone();
      },
      function clean(stepDone) {
        rmdir(dbPath, stepDone);
      }
    ], done);
  });

  it('should create a zip file and delete all the user\'s info on db', function (done) {
    var downloadPath = config.get('db:download');
    var backupDir = db.backupDir(credentials.username, domain);
    var zipFile = crypto.createHash('md5').update(dummyToken).digest('hex') + '.zip';

    async.series([
      function saveToken(stepDone) {
        db.save(credentials.username, domain, 'token', dummyToken);
        should.exists(db.infos(credentials.username, domain));
        stepDone();
      },
      function createBackup(stepDone) {
        backupDir.createDirs((err) => {
          if(err) {
            return stepDone(err);
          }
          should.equal(fs.existsSync(dbPath), true);
          stepDone();
        });
      },
      function createZip(stepDone) {
        db.createZip(credentials.username, domain, credentials.password, (err) => {
          if(err) {
            return stepDone(err);
          }
          should.equal(fs.existsSync(path.normalize(downloadPath + '/' + zipFile)), true);
          should.equal(fs.existsSync(backupDir.baseDir), false);
          stepDone();
        });
      },
      function deleteInfo(stepDone) {
        db.deleteBackup(credentials.username, domain, stepDone);
      },
      function verifyDeleted(stepDone) {
        should.equal(fs.existsSync(path.normalize(downloadPath + '/' + zipFile)), false);
        should.equal(fs.existsSync(dbPath), false);
        should.not.exists(db.infos(credentials.username, domain));
        stepDone();
      }
    ], done);
  });
});