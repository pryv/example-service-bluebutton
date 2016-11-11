var backup = require('backup-node'),
    connection = null,
    parameters = null;

module.exports.setConnection = function(conn, params) {
    connection = conn;
    parameters = params;
};

module.exports.startBackup = function(stdout, includeTrashed, includeAttachments) {
    if(!connection) {
        return stdout('Missing connection!');
    }
    if(!params) {
        return stdout('Missing connection parameters!');
    }
    parameters.includeTrashed = includeTrashed;
    parameters.includeAttachments = includeAttachments;
    backup.startOnConnection(connection, parameters, stdout);
};