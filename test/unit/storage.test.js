/* global describe, it */

var should = require('should'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    rmdir = require('rmdir'),
    crypto = require('crypto');

var db = require('../../src/storage/db'),
    config = require('../../src/config');


describe('Storage', function () {
  var credentials = require('../data/testUser.json');
  var dbPath = config.get('db:path') + credentials.username;
  var dummyToken = 'iamadummytoken';

  it('should load the user\'s info', function () {
    var userInfo = {info: 'blabla'};
    var json = JSON.stringify(userInfo);

    return Promise.all([
      new Promise((resolve) =>  {
        mkdirp.sync(dbPath);
        fs.writeFileSync(dbPath + '/infos.json', json);
        should.equal(fs.readFileSync(dbPath + '/infos.json', 'utf-8'), json);
        resolve();
      }),
      new Promise((resolve) => {
        db.load();
        resolve();
      }),
      new Promise((resolve) => {
        should.exists(db.infos(credentials.username));
        should.equal(db.infos(credentials.username).info, userInfo.info);
        resolve();
      }),
      new Promise((resolve, reject) => {
        rmdir(dbPath, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      })
    ]);
  });

  it('should save the user\'s token and update it', function () {
    return Promise.all([
      new Promise((resolve) => {
        db.save(credentials.username, 'token', dummyToken);
        resolve();
      }),
      new Promise((resolve) => {
        should.exists(db.infos(credentials.username));
        should.equal(db.infos(credentials.username).token, dummyToken);
        resolve();
      }),
      new Promise((resolve) => {
        db.save(credentials.username, 'token', dummyToken + 'updated');
        resolve();
      }),
      new Promise((resolve) => {
        should.exists(db.infos(credentials.username));
        should.equal(db.infos(credentials.username).token, dummyToken + 'updated');
        resolve();
      }),
      new Promise((resolve, reject) => {
        rmdir(dbPath, (err) => {
          if(err) {
            return reject(err);
          }
          resolve();
        });
      })
    ]);
  });

  it('should watch/unwatch the log file of provided user', function (done) {
    var message = 'coucou';

    db.watchLog(credentials.username, function (log, end) {
      should.equal(log, message + '\n');
      if (end) {
        db.unwatchLog(credentials.username);
        rmdir(dbPath, done);
      }
    });
    db.appendLog(credentials.username, message, true);
  });

  it('should append the log file of provided user with info message', function () {
    var message = 'info';

    return Promise.all([
      new Promise((resolve, reject) => {
        mkdirp.sync(dbPath);
        fs.open(dbPath + '/log.json', 'w+', (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      }),
      new Promise((resolve) => {
        db.appendLog(credentials.username, message);
        resolve();
      }),
      new Promise((resolve) => {
        should.equal(db.log(credentials.username), message + '\n');
        resolve();
      }),
      new Promise((resolve, reject) => {
        rmdir(dbPath, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      })
    ]);
  });

  it('should create a zip file and delete all the user\'s info on db', function () {
    var downloadPath = config.get('db:download');
    var backupDir = db.backupDir(credentials.username);
    var zipFile = crypto.createHash('md5').update(dummyToken).digest('hex') + '.zip';

    return Promise.all([
      new Promise((resolve, reject) => {
        db.save(credentials.username, 'token', dummyToken);

        backupDir.createDirs((err) => {
          if (err) {
            return reject(err);
          }
          should.equal(fs.existsSync(dbPath), true);
          should.exists(db.infos(credentials.username));
          resolve();
        });
      }),
      db.createZip(credentials.username, credentials.password),
      new Promise((resolve) => {
        //should.equal(fs.existsSync(dbPath), false);
        should.equal(fs.existsSync(downloadPath + zipFile), true);
        resolve();
      }),
      db.deleteBackup(credentials.username),
      new Promise((resolve) => {
        should.equal(fs.existsSync(dbPath), false);
        should.equal(fs.existsSync(downloadPath + zipFile), false);
        should.not.exists(db.infos(credentials.username));
        resolve();
      })
    ]);
  });
});