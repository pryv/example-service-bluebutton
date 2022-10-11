/* global module, require */

var $ = require('jquery'),
  display = require('./display');

var last_index = 0,
  username = '',
  password = '',
  apiEndpoint = '';

let actuallyLoggingIn = false;

module.exports.loginProcess = function() {
  if ($('.loginView').is(':visible') === false || actuallyLoggingIn) { return; }
  actuallyLoggingIn = true;
  username = $('#username').val();
  password = $('#password').val();

  if(username === '' || password === '') {
    display.colorError();
    display.alertDisplay('You must enter your username and password !');
    actuallyLoggingIn = false;
    return;
  } 

    var search = new RegExp('[?&]'+encodeURIComponent('serviceInfoUrl')+'=([^&]*)').exec(window.location.search);
    let serviceInfoUrl = null;
    if (search && search[1]) {
      serviceInfoUrl = decodeURIComponent(search[1]);
    }

    var data = { username: username,
      password: password,
      includeTrashed: $('#trashed:checked').length,
      includeAttachments: $('#attachment:checked').length,
      serviceInfoUrl: serviceInfoUrl
    };
    display.alertDisplay('Login in ...');
    ajaxPost('/login', data, function (res) {
      if (res) {
        apiEndpoint = res.apiEndpoint;
        display.stateChange('running');
        if (res.log) {
          checkLog(res.log);
        }
        readStatus(username);
      } 
      actuallyLoggingIn = false;
    });
};

module.exports.deleteBackup = function () {
  ajaxPost('/delete', { username: username, apiEndpoint: apiEndpoint}, function (res) {
    if (res) {
      display.stateChange('done');
    }
  });
};

function ajaxPost (url, data, callback) {
  console.log('POST ' + url, data);
  $.ajax({
    url: url,
    type : 'POST',
    data : data,
    success: function(res, textStatus, xhr) {
      if(xhr.status === 200) {
        callback(res);
      }
    },
    error: function(err){
      display.colorError();
      if(err.responseJSON) {
        display.alertDisplay(err.responseJSON.message);
      } else{
        display.alertDisplay(err.responseText);
      }
      callback();
    }
  });
}

function readStatus(username) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/status', true);
  xhr.onprogress = function () {
    var curr_index = xhr.responseText.length;
    if (last_index === curr_index) { return; }
    var str = xhr.responseText.substring(last_index, curr_index);
    last_index = curr_index;
    checkLog(str);
  };
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({username: username, apiEndpoint: apiEndpoint}));
}

function checkLog(str) {

  var lastLines = str.split('\n').filter(function (elem) {
    if (elem) { return elem; }
  }).splice(-2);

  if (lastLines.length === 2 && lastLines[1].substring(0, 3) === 'END') {
    display.logToConsole(str.substring(0, str.length - 4));
    if (lastLines[0].substring(0, 13) === 'Backup file: ') {
      backupComplete(lastLines[0].substring(13, str.length));
    } else {
      display.stateChange('done');
      $('#doneMessage').text('An error occurred during the backup, please try again.');
    }
  } else if (lastLines.length === 2 && lastLines[1].substring(0, 13) === 'Backup file: '){
    display.logToConsole(str);
    backupComplete(lastLines[1].substring(13, str.length));
  } else {
    display.logToConsole(str);
  }
}

function backupComplete(file) {
  display.stateChange('complete');
  $('form').get(0).setAttribute('action', '/download/' + file);
}