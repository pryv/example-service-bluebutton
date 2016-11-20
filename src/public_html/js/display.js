/* global module, require */

var $ = require("jquery");

module.exports.logToConsole = function (str) {
  var prev = $("#console").text();
  if (prev) {
    $("#console").text(prev + '\n' + str);
  } else {
    $("#console").text(str);
  }
};

module.exports.colorError = function () {
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
};

module.exports.changeWidth = function () {
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
};

module.exports.alertDisplay = function (message) {
  $("#alertMessage").text(message.formatMessage(Math.round($(".main").innerWidth() / 15)));
  $(".alert").show();
};

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