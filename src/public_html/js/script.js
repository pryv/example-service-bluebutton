/* global require */

var $ = require("jquery"),
  display = require('./display'),
  func = require('./function');

$(document).ready(function(){
  display.stateChange('login');
  display.changeWidth();
  $(window).resize(display.changeWidth);
  $(document).keypress(function (key) {
    if (key.which === 13) { func.loginProcess(); }
    if (key.which === 0) { $(".alert").hide(); }
  });
  $("#login").click(function(){
    func.loginProcess();
  });
  $("#delete").click(function() {
    func.deleteBackup();
  });
  $("#refresh").click(function() {
    history.go(0)
  });
});