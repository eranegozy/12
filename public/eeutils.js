//-------------------------------
// eeutils.js
// Copyright (c) 2015 Eran Egozy
// Released under the MIT License
//-------------------------------



utl = (function() {
  var gOutID = null;  // null, 'console', or elementID string.
  var gTouchDetected = false;

  supportsTouch = function () {
    return gTouchDetected;
  }

  init = function ( _outID )
  {
    gOutID = _outID;
    gTouchDetected = 'ontouchstart' in window || navigator.msMaxTouchPoints;
    print("init. touch = " + (supportsTouch()?'yes':'no'));
  }

  print = function(s) {
    if (gOutID == null)
      return;

    if (gOutID == 'console') {
      console.log(s);
    }

    else {
      var x = document.getElementById(gOutID).innerHTML;
      x += s + '<br/>'
      document.getElementById(gOutID).innerHTML = x;
    }
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

  return { init:init, print:print, setCookie:setCookie, getCookie:getCookie, supportsTouch:supportsTouch};
}());
