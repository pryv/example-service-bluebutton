/* global module, require */

var $ = require("jquery"),
  display = require('./display');

var last_index = 0,
  username = '',
  password = '',
  token = '';

function readStatus(username, token) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/status', true);

  xhr.onprogress = function () {
    var curr_index = xhr.responseText.length;
    if (last_index == curr_index) return;
    var str = xhr.responseText.substring(last_index, curr_index);
    last_index = curr_index;
    display.logToConsole(str);
    if (str.lastLine() === 'Backup completed!') {
      display.stateChange('complete');
    }
  };
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({username: username, token: token}));
}

module.exports.downloadBackup = function() {

  console.log(username, password, token);

  $.ajax({
    url: "/download",
    type : 'POST',
    data : {username: username, token: token},
    success: function(res, textStatus, xhr) {
      //TODO receive backup directory
      console.log(res);
      if(xhr.status === 200) {
        $(function() {
          //...
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
};

// TODO handle re-connection with include and attachment param difference
module.exports.loginProcess = function() {
  if ($(".loginView").is(":visible") === false) { return; }

  username = $("#username").val();
  password = $("#password").val();

  var trashed = false;
  var attachments = false;

  if ($("#trashed:checked").length === 1) {
    trashed = true;
  }
  if ($("#attachment:checked").length === 1) {
    attachments = true;
  }
  if(username === '' || password === '') {
    display.colorError();
    display.alertDisplay("You must enter your username and password !");
  } else {
    $.ajax({
      url: "/login",
      type : 'POST',
      data : { username: username, password: password, includeTrashed: trashed, includeAttachments: attachments },
      success: function(res, textStatus, xhr) {
        if(xhr.status === 200) {
          $(function() {
            token = res;
            display.stateChange('running');
            readStatus(username, token);
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

String.prototype.lastLine = function () {
  return this.split('\n').filter(function (elem) {
    if (elem) { return elem; }
  }).slice(-1)[0];
};
