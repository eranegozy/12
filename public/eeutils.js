//-------------------------------
// eeutils.js
// Copyright (c) 2015 Eran Egozy
// Released under the MIT License
//-------------------------------


// TODO - do scoping of this better. Probably using a function or something.

//---------------------------------
var eeutils =
{
   outID: 'output',

   init: function( _outID )
   {
      eeutils.outID = _outID;
      eeutils.print("init");
   },

   print: function (s)
   {
      var x = document.getElementById(eeutils.outID).innerHTML;
      x += s + '<br/>'
      document.getElementById(eeutils.outID).innerHTML = x;
   }


}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

