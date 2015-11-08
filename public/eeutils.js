//-------------------------------
// eeutils.js
// Copyright (c) 2015 Eran Egozy
// Released under the MIT License
//-------------------------------



utl = (function() {
  var outID = null;

  init = function ( _outID )
  {
    outID = _outID;
    print("init!!");
  }

  print = function(s) {
    var x = document.getElementById(outID).innerHTML;
    x += s + '<br/>'
    document.getElementById(outID).innerHTML = x;
  }

  setCookie = function (cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }

  getCookie = function (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
  }

  return { init:init, print:print, setCookie:setCookie, getCookie:getCookie};
}());
