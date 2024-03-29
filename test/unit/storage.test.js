/* global describe, it */

var should = require('should'),
    async = require('async'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    exec = require('child_process').exec
    path = require('path'),
    crypto = require('crypto');

var db = require('../../src/storage/db'),
    config = require('../../src/config');


describe('Storage', function () {
  var credentials = require('../data/testUser.json');
  var domain = 'pryv.me'
  var dbPath = path.normalize(config.get('db:path') + '/' + credentials.username + '.' + domain);
  var dummyToken = 'iamadummytoken';
  credentials.apiEndpoint = 'https://' + dummyToken + '@' +  credentials.username + '.' + domain;

  it('[BLUP] should load the user\'s info', function (done) {
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
        should.exists(db.infos(credentials.apiEndpoint));
        should.equal(db.infos(credentials.apiEndpoint).info, userInfo.info);
        stepDone();
      },
      function clean(stepDone) {
        exec('rm -r ' + dbPath, stepDone);
      }
    ], done);
  });

  it('[BLOP] should save the user\'s something and update it', function (done) {
    async.series([
      function saveSomething(stepDone) {
        db.save(credentials.apiEndpoint, 'something', dummyToken);
        stepDone();
      },
      function verifySaved(stepDone) {
        should.exists(db.infos(credentials.apiEndpoint));
        should.equal(db.infos(credentials.apiEndpoint).something, dummyToken);
        stepDone();
      },
      function updateToken(stepDone) {
        db.save(credentials.apiEndpoint, 'something', dummyToken + 'updated');
        stepDone();
      },
      function verifyUpdated(stepDone) {
        should.exists(db.infos(credentials.apiEndpoint));
        should.equal(db.infos(credentials.apiEndpoint).something, dummyToken + 'updated');
        stepDone();
      },
      function clean(stepDone) {
        exec('rm -r ' + dbPath, stepDone);
      }
    ], done);
  });

  it('[BLAP] should watch/unwatch the log file of provided user', function (done) {
    var message = 'coucou';

    db.watchLog(credentials.apiEndpoint, function (log, end) {
      should.equal(log, message + '\n');
      if (end) {
        db.unwatchLog(credentials.apiEndpoint);
        exec('rm -r ' + dbPath, done);
      }
    });
    db.appendLog(credentials.apiEndpoint, message, true);
  });

  it('[BLUP] should append the log file of provided user with info message', function (done) {
    var message = 'info';

    async.series([
      function createLog(stepDone) {
        mkdirp.sync(dbPath);
        fs.open(path.normalize(dbPath + '/log.json'), 'w+', stepDone);
      },
      function appendLog(stepDone) {
        db.appendLog(credentials.apiEndpoint, message);
        stepDone();
      },
      function testLog(stepDone) {
        should.equal(db.log(credentials.apiEndpoint), message + '\n');
        stepDone();
      },
      function clean(stepDone) {
        exec('rm -r ' + dbPath, stepDone);
      }
    ], done);
  });

  it('[BLYP] should create a zip file and delete all the user\'s info on db', function (done) {
    var downloadPath = config.get('db:download');
    var backupDir = db.backupDir(credentials.apiEndpoint);
    var zipFile = crypto.createHash('md5').update(credentials.apiEndpoint).digest('hex') + '.zip';

    async.series([
      function saveToken(stepDone) {
        db.save(credentials.apiEndpoint, 'apiEndpoint', credentials.apiEndpoint);
        should.exists(db.infos(credentials.apiEndpoint));
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
        db.createZip(credentials.apiEndpoint, credentials.password, (err, file) => {
          if(err) {
            return stepDone(err);
          }
          should.equal(fs.existsSync(path.normalize(downloadPath + '/' + zipFile)), true);
          should.equal(fs.existsSync(backupDir.baseDir), false);
          stepDone();
        });
      },
      function deleteInfo(stepDone) {
        db.deleteBackup(credentials.apiEndpoint, stepDone);
      },
      function verifyDeleted(stepDone) {
        should.equal(fs.existsSync(path.normalize(downloadPath + '/' + zipFile)), false);
        should.equal(fs.existsSync(dbPath), false);
        should.not.exists(db.infos(credentials.apiEndpoint));
        stepDone();
      }
    ], done);
  });
});