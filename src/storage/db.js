/**
 * Created with IntelliJ IDEA.
 * User: perki
 * Date: 07.11.16
 * Time: 16:07
 * To change this template use File | Settings | File Templates.
 */

var mkdirp = require('mkdirp');
var config = require('../config');
var fs = require('fs');
var path = require('path');


var dbPath = config.get('db:path');

mkdirp(dbPath);

var db = {};

module.exports.load = function () {
  var ls = fs.readdirSync(dbPath);
  ls.forEach(function (username) { 
    if (fs.statSync(dbPath + username).isDirectory()) {
      var infos = require(userDbPath(username, '/infos.json'));
      db[username] = infos;
    }
  });
  console.log('Loaded ' + Object.keys(db).length + ' users.');
};

module.exports.save = function (username, key, value) {
  var infos = db[username] ? db[username] : {};
  infos[key] = value;
  fs.writeFileSync(userDbPath(username, '/infos.json'), JSON.stringify(infos));
  db[username] = infos;
};

module.exports.appendLog = function (username, message) {
  fs.writeFileSync(userDbPath(username, '/log.json'), message + '\n', {'flag':'a'});
};

module.exports.resetLog = function (username) {
  fs.writeFileSync(userDbPath(username, '/log.json'), "");
};

module.exports.log = function (username) {
  return fs.readFileSync(userDbPath(username, '/log.json'), 'utf-8');
};

module.exports.infos = function (username) {
  return db[username];
};

module.exports.delete = function (username) {
  fs.writeFileSync(userDbPath(username, '/infos.json'), JSON.stringify({}));
  db[username] = null;
};

function userDbPath(username, extra) {
  var str = dbPath + username;
  mkdirp(path.normalize(str));
  if (extra) { str += extra; }
  return path.normalize(str);
}