var config = require('../config'),
    logger = require('winston');

var redis = require('redis').createClient(config.get('redis:port'));

redis.on('error', function (err) {
  logger.error('Redis error:', err);
});

/**
 * Erases all entries, returns an array of the size of erased entries
 *
 * @param callback
 */
module.exports.reset = function (callback) {
  redis.flushdb(function (err, res) {
    return callback(err, res);
  });
};

/**
 * save password
 *
 * @param credentials
 * @param callback
 */
module.exports.set = function (credentials, callback) {
  redis.set('password:' + credentials.username, credentials.password, callback);
};

/**
 * retrieve password
 *
 * @param username
 * @param callback
 */
module.exports.get = function (username, callback) {
  redis.get('password:' + username, callback);
};