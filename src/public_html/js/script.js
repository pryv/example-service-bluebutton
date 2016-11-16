var $ = require("jquery");

$(document).ready(function(){
  changeWidth();
  stateChange('login');
  $("#login").click(function(){
    loginProccess();
  });
  $(document).keypress(function (key) {
    if (key.which === 13) { loginProccess(); }
    if (key.which === 0) { $(".alert").hide(); }
  });
  $(window).resize(changeWidth);
});

/*
 ** Script functions
 */

function loginProccess() {
  if ($(".loginView").is(":visible") === false) { return; }

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

var last_index = 0;

function readStatus(username, token) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/status', true);

  xhr.onprogress = function () {
    var curr_index = xhr.responseText.length;
    if (last_index == curr_index) return;
    var str = xhr.responseText.substring(last_index, curr_index);
    last_index = curr_index;
    logToConsole(str);
  };
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({username: username, token: token}));
}

function logToConsole(str) {
  var prev = $("#console").text();
  if (prev) {
    $("#console").text(prev + '\n' + str);
  } else {
    $("#console").text(str);
  }
}

function stateChange(state) {
  switch(state){
    case "login":
      $(".loginView").show();
      $(".consoleView").hide();
      $(".alert").hide();
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

function changeWidth() {
  var width = $(window).width();
  if (width <= 1000) {
    $(".wrapper").width(425);
  } else if (width <= 1400) {
    $(".wrapper").width(875);
  } else if (width <= 1600) {
    $(".wrapper").width(1075);
  } else if (width > 1600) {
    $(".wrapper").width(1275);
  }
}

function alertDisplay(message) {
  $("#alertMessage").text(message.formatMessage(Math.round($(".main").innerWidth() / 15)));
  $(".alert").show();
}

String.prototype.formatMessage = function (width) {
  var str = this.toString();
  for (var i = 0; i < str.length; i++) {
    if (i != 0 && i % width === 0) {
      for (var j = i; j > 0; j--) {
        if (str[j] === ' ') {
          str = str.substr(0, j) + '\n' + str.substr(j + 1);
          break;
        }
      }
    }
  }
  return str;
};