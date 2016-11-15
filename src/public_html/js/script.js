var $ = require("jquery");

$(document).ready(function(){
  $(".alert").hide();
  stateChange('login');
  $("#login").click(function(){
    loginProccess();
  });
  $(document).keypress(function (key) {
    if(key.which === 13) { loginProccess(); }
  });

});
function loginProccess() {
  // TODO: Add backup button
  // TODO: Handle response with status
  var username = $("#username").val();
  var password = $("#password").val();
  if( username === '' || password === ''){
    colorError();
    alertDisplay("You must enter your username and password !");
  } else {
    $.ajax({
      url: "/login",
      type : 'POST',
      data : { username: username, password: password },
      success: function(data, textStatus, xhr) {
        if(xhr.status === 200) {
          $(function() {
            stateChange('running');
            readStatus(username, data);
          });
        }
      },
      error: function(err){
        colorError();
        if(err.responseJSON) {
          alertDisplay(err.responseJSON.message);
        } else{
          alertDisplay(err.responseText);
        }
      }
    });
  }
}

/*
 ** Script functions
 */

var last_index = 0;

function readStatus(username, token) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/status', true);

  xhr.onprogress = function () {
    var curr_index = xhr.responseText.length;
    if (last_index == curr_index) return;
    var s = xhr.responseText.substring(last_index, curr_index);
    last_index = curr_index;
    logToConsole(s);
  };
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({username: username, token: token}));
}

var $console = document.getElementById('console');

function logToConsole(text) {
  $console.value = text;
  $console.scrollTop =$console.scrollHeight;
}

function stateChange(state) {
  switch(state){
    case "login":
      $(".loginView").show();
      $(".consoleView").hide();
      break;
    case "running":
      $(".loginView").hide();
      $(".consoleView").show();
      $(".alert").hide();
      break;
    case "done":
      break;
    default:
      // error
  }
}

/*
 ** Format and adapt display
 */

function colorError() {
  $('input[type="text"],input[type="password"]').css({
    "border": "1px solid #B40000",
    "border-radius": "4px",
    "box-shadow": "inset 0px 0px 1px 0px #9b9b9b, 0px 0px 5px 0px rgba(139,0,0, 0.75)"
  });
  $('input[type="text"],input[type="username"]').css({
    "border": "1px solid #B40000",
    "border-radius": "4px",
    "box-shadow": "inset 0px 0px 1px 0px #9b9b9b, 0px 0px 5px 0px rgba(139,0,0, 0.75)"
  });
}

function alertDisplay(message) {
  if (message.isTooBig($(".main").innerWidth() / 15) === true) {
    message = message.formatMessage($(".main").innerWidth() / 15);
  }
  console.log(message);
  $("#alertMessage").text(message);
  $(".alert").show();
}

String.prototype.formatMessage = function (width) {
  var newMessage = '';
  for (var i = 0; i < this.length; i++) {
    if (i % Math.round(width) === 0) { newMessage += '\n'; }
    else { newMessage += this[i]; }
  }
  return newMessage;
};

String.prototype.isTooBig = function (width) {
  var count = 0;
  for (var i = 0; i < this.length; i++) {
    if (this[i] === '\n') { count = 0; }
    if (count === i) { return true }
    count++;
  }
  console.log(count);
  return false;
};