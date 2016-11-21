/* global module, require */

var $ = require("jquery"),
  fs = require('fs'),
  display = require('./display');

var last_index = 0,
  username = '',
  password = '',
  token = '';

function readStatus(username) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/status', true);

  xhr.onprogress = function () {
    var curr_index = xhr.responseText.length;
    if (last_index == curr_index) return;
    var str = xhr.responseText.substring(last_index, curr_index);
    last_index = curr_index;
    backupComplete(str);
  };
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({username: username, token: token}));
}

function backupComplete(str) {
  display.logToConsole(str);
  var lastLine = str.split('\n').filter(function (elem) {
    if (elem) { return elem; }
  }).slice(-1)[0];
  if (lastLine.substring(0, 13) === 'Backup file: ') {
    var backup = '/download/' + lastLine.substring(13, str.length);
    display.stateChange('complete');
    $('form').get(0).setAttribute('action', backup);
  }
}

// TODO handle re-connection with include and attachment param difference
module.exports.loginProcess = function() {
  if ($(".loginView").is(":visible") === false) { return; }

  username = $("#username").val();
  password = $("#password").val();

  if(username === '' || password === '') {
    display.colorError();
    display.alertDisplay("You must enter your username and password !");
  } else {
    $.ajax({
      url: "/login",
      type : 'POST',
      data : { username: username,
        password: password,
        includeTrashed: $("#trashed:checked").length,
        includeAttachments: $("#attachment:checked").length },
      success: function(res, textStatus, xhr) {
        if(xhr.status === 200) {
          $(function() {
            token = res.token;
            display.stateChange('running');
            if (res.log) {
              backupComplete(res.log);
            }
            readStatus(username);
          });
        }
      },
      error: function(err){
        display.colorError();
        if(err.responseJSON) {
          display.alertDisplay(err.responseJSON.message);
        } else{
          display.alertDisplay(err.responseText);
        }
      }
    });
  }
};

module.exports.deleteBackup = function () {
  $.ajax({
    url: "/delete",
    type : 'POST',
    data : { username: username, token: token},
    success: function(res, textStatus, xhr) {
      if(xhr.status === 200) {
        display.stateChange('done');
      }
    },
    error: function(err){
      display.colorError();
      if(err.responseJSON) {
        display.alertDisplay(err.responseJSON.message);
      } else{
        display.alertDisplay(err.responseText);
      }
    }
  });
};