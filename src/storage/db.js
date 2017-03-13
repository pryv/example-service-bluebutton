
var mkdirp = require('mkdirp'),
    config = require('../config'),
    fs = require('fs'),
    path = require('path'),
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

var infosCache = {};
var watchers = {};
var backupDirs = {};
var zipFiles = {};

module.exports.load = function () {
  var ls = fs.readdirSync(dbPath);
  ls.forEach(function (username) {
    if (fs.statSync(dbPath + username).isDirectory()) {
      var infos = require(userDbPath(username, '/infos.json'));
      infosCache[username] = infos;
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
module.exports.save = function (username, key, value) {
  infosCache[username] = infosCache[username] || {};
  infosCache[username][key] = value;
  fs.writeFileSync(userDbPath(username, '/infos.json'), JSON.stringify(infosCache[username]));
};

/**
 * returns the content of /username/log.json file
 *
 * @param username
 * @returns {*}
 */
module.exports.log = function (username) {
  var file = userDbPath(username, '/log.json');
  if (!fs.existsSync(file)) {
    fs.openSync(file, 'w+');
  }
  return fs.readFileSync(file, 'utf-8');
};

/**
 * appends message to /username/log.json file, notifies the message to the watchers.
 *
 * @param username
 * @param message
 * @param end       {Boolean} true if backup is finished, false otherwise
 */
module.exports.appendLog = function (username, message, end) {
  fs.writeFileSync(userDbPath(username, '/log.json'), message + '\n', {'flag': 'a'});
  var watcher = watchers[username];
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
module.exports.watchLog = function (username, notify) {
  watchers[username] = notify;
};

/**
 * unregisters watcher for a user.
 *
 * @param username
 */
module.exports.unwatchLog = function (username) {
  watchers[username] = null;
};

/**
 * returns cached info data
 *
 * @param username
 * @returns {*}
 */
module.exports.infos = function (username) {
  return infosCache[username];
};

module.exports.deleteBackup = function (username) {
  return Promise.all([
    new Promise((resolve, reject) => {
      if(fs.existsSync(dbPath + username)) {
        var exec = require('child_process').exec;
        exec('rm -r ' + dbPath + username, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      }
      resolve();
    }),
    new Promise((resolve) => {
      if(infosCache[username]) {
        delete infosCache[username];
      }
      resolve();
    }),
    new Promise((resolve, reject) => {
      module.exports.backupDir(username).deleteDirs((err) => {
        if(err) {
          return reject(err);
        }
        resolve();
      });
    }),
    new Promise((resolve, reject) => {
      var zip = zipPath + zipFiles[username];
      if(zipFiles[username] && fs.existsSync(zip)) {
        fs.unlink(zip, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      } else {
        resolve();
      }
    }),
    new Promise((resolve) => {
      if(zipFiles[username]) {
        delete zipFiles[username];
      }
      resolve();
    })]);
};

module.exports.createZip = function (username, password) {
  return new Promise((resolve, reject) => {
    var token = module.exports.infos(username).token;
    var hash = crypto.createHash('md5').update(token).digest('hex');
    var file = hash + '.zip';
    if (!fs.existsSync(zipPath)) {
      fs.mkdirSync(zipPath);
    }

    var baseDir = module.exports.backupDir(username).baseDir;
    var spawn = require('child_process').spawn;
    var zipCmd = spawn('zip',['-P', password , zipPath + file,
      '-r', './'], {cwd: baseDir});

    zipCmd.on('exit', (code) => {
      if(code !== 0) {
        return reject('Zip creation error');
      }
      zipFiles[username] = file;

      resolve(file);

      /*module.exports.backupDir(username).deleteDirs((err) => {
        if (err) {
          return reject(err);
        }

        resolve(file);
      });*/
    });
  });
};

module.exports.backupDir = function (username) {
  if (!backupDirs[username]) {
    backupDirs[username] = new BackupDirectory(username, config.get('pryv:domain'),
          backupPath);
  }
  return backupDirs[username];
};

function userDbPath(username, extra) {
  var str = dbPath + username;
  mkdirp.sync(path.normalize(str));
  if (extra) {
    str += extra;
  }
  return path.normalize(str);
}
