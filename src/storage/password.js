var config = require('../config');

var redis = require('redis').createClient(config.get('redis:port'));

/**
 * save password
 *
 * @param credentials
 * @param callback
 */
module.exports.setPassword = function (credentials, callback) {
  redis.set('password:' + credentials.username, credentials.password, callback);
};

/**
 * retrieve password
 *
 * @param username
 * @param callback
 */
module.exports.getPassword = function (username, callback) {
  redis.get('password:' + username, callback);
};