/**
 * Created with IntelliJ IDEA.
 * User: perki
 * Date: 07.11.16
 * Time: 16:07
 * To change this template use File | Settings | File Templates.
 */

var mkdirp = require('mkdirp'),
    config = require('../config'),
    fs = require('fs'),
    path = require('path'),
    rmdir = require('rmdir'),
    async = require('async'),
    crypto = require('crypto'),
    backup = require('backup-node'),
    BackupDirectory = backup.Directory;

var dbPath = config.get('db:path'),
    zipPath = config.get('db:download'),
    backupPath = config.get('db:backup');

// creating directories if needed
mkdirp.sync(dbPath);
mkdirp.sync(zipPath);
mkdirp.sync(backupPath);

var infosCache = {},
    watchers = [],
    backupDirs = [],
    zipFiles = [];

module.exports.load = function () {
  var ls = fs.readdirSync(dbPath);
  ls.forEach(function (endpoint) {
    if (fs.statSync(userDbPath(endpoint)).isDirectory()) {
      infosCache[endpoint] = require(userDbPath(endpoint, 'infos.json'));
    }
  });
  console.log('Loaded ' + Object.keys(infosCache).length + ' users.');
};

/**
 * saves a key value object in username/info.json
 *
 * @param username
 * @param key
 * @param value
 */
module.exports.save = function (username, domain, key, value) {
  infosCache[userDomainPath(username, domain)] = infosCache[userDomainPath(username, domain)] || {};
  infosCache[userDomainPath(username, domain)][key] = value;
  var infos = userDbPath(userDomainPath(username, domain),'infos.json');
  fs.writeFileSync(infos, JSON.stringify(infosCache[userDomainPath(username, domain)]));
};

/**
 * returns the content of /username/log.json file
 *
 * @param username
 * @returns {*}
 */
module.exports.log = function (username, domain) {
  var file = userDbPath(userDomainPath(username, domain), 'log.json');
  return fs.readFileSync(file, 'utf-8');
};

/**
 * appends message to /username/log.json file, notifies the message to the watchers.
 *
 * @param username
 * @param message
 * @param end       {Boolean} true if backup is finished, false otherwise
 */
module.exports.appendLog = function (username, domain, message, end) {
  fs.writeFileSync(userDbPath(userDomainPath(username, domain), 'log.json'), message + '\n', {'flag': 'a'});
  var watcher = watchers[userDomainPath(username, domain)];
  if (typeof watcher === 'function') {
    watcher(message + '\n', end);
  }
};

/**
 * registers watcher for the /username/log.json file
 *
 * @param username {String}
 * @param notify   {Function} callback for the notification
 */
module.exports.watchLog = function (username, domain, notify) {
  watchers[userDomainPath(username, domain)] = notify;
};

/**
 * unregisters watcher for a user.
 *
 * @param username
 */
module.exports.unwatchLog = function (username, domain) {
  watchers[userDomainPath(username, domain)] = null;
};

/**
 * returns cached info data
 *
 * @param username
 * @returns {*}
 */
module.exports.infos = function (username, domain) {
  return infosCache[userDomainPath(username, domain)];
};

module.exports.deleteBackup = function (username, domain, callback) {
  async.series([
    function removeInfos(stepDone) {
      var userDir = path.normalize(dbPath + '/' + userDomainPath(username, domain));
      if(fs.existsSync(userDir)) {
        return rmdir(userDir, stepDone);
      } else {
        stepDone();
      }
    },
    function removeInfosCache(stepDone) {
      if(infosCache[userDomainPath(username, domain)]) {
        delete infosCache[userDomainPath(username, domain)];
      }
      stepDone();
    },
    function removeData(stepDone) {
      module.exports.backupDir(username, domain).deleteDirs(stepDone);
    },
    function removeZip(stepDone) {
      var zip = path.normalize(zipPath + '/' + zipFiles[userDomainPath(username, domain)]);
      if(zipFiles[userDomainPath(username, domain)] && fs.existsSync(zip)) {
        fs.unlink(zip, stepDone);
      } else {
        stepDone();
      }
    },
    function removeZipCache(stepDone){
      if(zipFiles[userDomainPath(username, domain)]) {
        delete zipFiles[userDomainPath(username, domain)];
      }
      stepDone();
    }
  ], callback);
};

module.exports.createZip = function (username, domain, password, callback) {
  var token = module.exports.infos(username, domain).token;
  var hash = crypto.createHash('md5').update(token).digest('hex');
  var file = hash + '.zip';
  if (!fs.existsSync(zipPath)) {
    fs.mkdirSync(zipPath);
  }
  var backupDir = module.exports.backupDir(username, domain).baseDir;
  var spawn = require('child_process').spawn;
  var zipCmd = spawn('zip',['-P', password , path.normalize(zipPath + '/' +file),
    '-r', './'], {cwd: backupDir});

  zipCmd.on('exit', function(code) {
    if(code !== 0) {
      return callback('Zip creation error');
    }
    zipFiles[userDomainPath(username, domain)] = file;

    module.exports.backupDir(username, domain).deleteDirs(function(err) {
      callback(err, file);
    });
  });
};

module.exports.backupDir = function (username, domain) {
  if (!backupDirs[userDomainPath(username, domain)]) {
    backupDirs[userDomainPath(username, domain)] = new BackupDirectory(username, domain, backupPath);
  }
  return backupDirs[userDomainPath(username, domain)];
};

function userDbPath (endpoint, extra) {
  var str = path.normalize(dbPath + '/' + endpoint);
  mkdirp.sync(str);

  if (extra) {
    str = path.normalize(str + '/' + extra);
    if (!fs.existsSync(str)) {
      fs.openSync(str, 'w+');
    }
  }
  return str;
}

function userDomainPath (username, domain) {
  return username + '.' + domain;
}