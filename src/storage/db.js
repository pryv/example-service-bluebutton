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
    async = require('async');

var dbPath = config.get('db:path');

mkdirp(dbPath);

var infosCache = {},
    watchers = [];

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
    if(!fs.existsSync(file)) {
        fs.openSync(file, "w+");
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
    if(typeof watcher == 'function') {
        watcher(message+'\n', end);
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

module.exports.delete = function (username, callback) {
    async.series([
        function removeOnDisk(stepDone) {
            rmdir(dbPath + username, stepDone);
        },
        function removeOnDb(stepDone) {
            delete infosCache[username];
            stepDone();
        }
    ], callback);
};

function userDbPath(username, extra) {
    var str = dbPath + username;
    mkdirp.sync(path.normalize(str));
    if (extra) {
        str += extra;
    }
    return path.normalize(str);
}