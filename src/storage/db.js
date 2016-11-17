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

var db = {},
    writeStreams = [],
    readStreams = [];

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

module.exports.createLog = function (username) {
    var log = userDbPath(username, '/log.json');
    fs.openSync(log, 'w');
    var readStream = fs.createReadStream(log);
    readStream.setEncoding('utf8');
    readStreams[username] = readStream;
    var writeStream = fs.createWriteStream(log);
    writeStreams[username] = writeStream;
};

module.exports.watchLog = function (username, notify) {
    writeStreams[username].on('data', function(chunk) {
        notify(chunk);
    });
};

module.exports.appendLog = function (username, message, end) {
    var stream = writeStreams[username];
    message += '\n';
    if(stream) {
        if(end) {
            stream.write(message);
            stream.end();
            stream = null;
        } else {
            stream.write(message);
        }
    }
    // TODO: error handling
};

module.exports.infos = function (username) {
    return db[username];
};

module.exports.delete = function (username, callback) {
    async.series([
        function removeOnDisk(stepDone) {
            rmdir(dbPath + username, stepDone);
        },
        function removeOnDb(stepDone) {
            db[username] = null;
            stepDone();
        }
    ], callback);
};

function userDbPath(username, extra) {
    var str = dbPath + username;
    mkdirp(path.normalize(str));
    if (extra) {
        str += extra;
    }
    return path.normalize(str);
}