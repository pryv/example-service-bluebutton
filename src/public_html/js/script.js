/* global require */

var $ = require("jquery"),
  display = require('./display'),
  func = require('./function');

$(document).ready(function(){
  display.changeWidth();
  func.stateChange('login');
  $("#login").click(function(){
    func.loginProcess();
  });
  $(document).keypress(function (key) {
    if (key.which === 13) { func.loginProcess(); }
    if (key.which === 0) { $(".alert").hide(); }
  });
  $(window).resize(display.changeWidth);
});