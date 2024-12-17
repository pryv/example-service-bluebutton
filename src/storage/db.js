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
    exec = require('child_process').exec,
    async = require('async'),
    crypto = require('crypto'),
    backup = require('@pryv/account-backup'),
    BackupDirectory = backup.Directory;

const { extractTokenAndAPIEndpoint } = require('pryv').utils;

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
  ls.forEach(function (key) {
    if (fs.statSync(path.normalize(dbPath + '/' + key)).isDirectory()) {
      const content = require(path.normalize(dbPath + '/' + key + '/infos.json'));
      infosCache[key] = content;
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
module.exports.save = function (apiEndpoint, key, value) {
  const apiKey = keyFromEndpoint(apiEndpoint);
  infosCache[apiKey] = infosCache[apiEndpoint] || {};
  infosCache[apiKey][key] = value;
  infosCache[apiKey].apiEndpoint = apiEndpoint;
  var infos = userDbPath(apiEndpoint,'infos.json');
  fs.writeFileSync(infos, JSON.stringify(infosCache[apiKey]));
};

/**
 * returns the content of /username/log.json file
 *
 * @param username
 * @returns {*}
 */
module.exports.log = function (apiEndpoint) {
  var file = userDbPath(apiEndpoint, 'log.json');
  return fs.readFileSync(file, 'utf-8');
};

/**
 * appends message to /username/log.json file, notifies the message to the watchers.
 *
 * @param username
 * @param message
 * @param end       {Boolean} true if backup is finished, false otherwise
 */
module.exports.appendLog = function (apiEndpoint, message, end) {
  fs.writeFileSync(userDbPath(apiEndpoint, 'log.json'), message + '\n', {'flag': 'a'});
  var watcher = watchers[keyFromEndpoint(apiEndpoint)];
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
module.exports.watchLog = function (apiEndpoint, notify) {
  watchers[keyFromEndpoint(apiEndpoint)] = notify;
};

/**
 * unregisters watcher for a user.
 *
 * @param username
 */
module.exports.unwatchLog = function (apiEndpoint) {
  watchers[keyFromEndpoint(apiEndpoint)] = null;
};

/**
 * returns cached info data
 *
 * @param username
 * @returns {*}
 */
module.exports.infos = function (apiEndpoint) {
  return infosCache[keyFromEndpoint(apiEndpoint)];
};

module.exports.deleteBackup = function (apiEndpoint, callback) {
  const apiKey = keyFromEndpoint(apiEndpoint)
  async.series([
    function removeInfos(stepDone) {
      var userDir = path.normalize(dbPath + '/' + apiKey);
      if(fs.existsSync(userDir)) {
        return exec('rm -r ' + userDir, stepDone);
      } else {
        stepDone();
      }
    },
    function removeInfosCache(stepDone) {
      if(infosCache[apiKey]) {
        delete infosCache[apiKey];
      }
      stepDone();
    },
    function removeData(stepDone) {
      module.exports.backupDir(apiEndpoint).deleteDirs(stepDone);
    },
    function removeZip(stepDone) {
      var zip = path.normalize(zipPath + '/' + zipFiles[apiKey]);
      if(zipFiles[apiKey] && fs.existsSync(zip)) {
        fs.unlink(zip, stepDone);
      } else {
        stepDone();
      }
    },
    function removeZipCache(stepDone){
      if(zipFiles[apiKey]) {
        delete zipFiles[apiKey];
      }
      stepDone();
    }
  ], callback);
};

module.exports.createZip = function (apiEndpoint, password, callback) {
  module.exports.appendLog(apiEndpoint, 'Creating backup archive...');
  var fullApiEndpoint = module.exports.infos(apiEndpoint).apiEndpoint;
  var hash = crypto.createHash('md5').update(fullApiEndpoint).digest('hex');
  var file = hash + '.zip';
  if (!fs.existsSync(zipPath)) {
    fs.mkdirSync(zipPath);
  }
  var backupDir = module.exports.backupDir(apiEndpoint).baseDir;
  var spawn = require('child_process').spawn;
  var zipCmd = spawn('zip',['-P', password , path.normalize(zipPath + '/' +file),
    '-r', './'], {cwd: backupDir});
  zipCmd.stdout.on('data', function(data) {
    module.exports.appendLog(apiEndpoint, data);
  });
  zipCmd.on('exit', function(code) {
    if(code !== 0) {
      return callback('Archive creation error');
    }
    zipFiles[keyFromEndpoint(apiEndpoint)] = file;

    module.exports.backupDir(apiEndpoint).deleteDirs(function(err) {
      callback(err, file);
    });
  });
};

module.exports.backupDir = function (apiEndpoint) {
  const apiKey = keyFromEndpoint(apiEndpoint)
  if (!backupDirs[apiKey]) {
    backupDirs[apiKey] = new BackupDirectory(apiEndpoint, backupPath);
  }
  return backupDirs[apiKey];
};

function userDbPath (endpoint, extra) {
  const userKey = keyFromEndpoint(endpoint);

  var str = path.normalize(dbPath + '/' + userKey);
  mkdirp.sync(str);

  if (extra) {
    str = path.normalize(str + '/' + extra);
    if (!fs.existsSync(str)) {
      fs.openSync(str, 'w+');
    }
  }
  return str;
}

function keyFromEndpoint(apiEndpoint) {
  
  if (! apiEndpoint || ! apiEndpoint.startsWith('https://')) { 
    throw new Error('Invalid apiEndPoint [' + apiEndpoint + ']');
  }
  const { endpoint } =  extractTokenAndAPIEndpoint(apiEndpoint);
  // remove https 
  let str = endpoint.substring(8);
  // enventual trailing / 
  if (str.charAt(str.length -1 ) === '/') {
    str = str.substring(0, str.length -1);
  }
  const result = str.replace('/\//g', '_'); // replace '/' with '_'
  return result;
}

module.exports.keyFromEndpoint = keyFromEndpoint;