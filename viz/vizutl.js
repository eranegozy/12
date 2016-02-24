// utl.js


vizutl = (function() {

  var gSounds = [];
  var gFPS = 0;
  var gLastObjCount = 0;

  drawFPS = function () {
    fill(0)
    stroke(100);
    rect(50, 28, 200, 40);
    noStroke();
    fill(200);
    textSize(20);
    gFPS = 0.9 * gFPS + 0.1 * frameRate();
    text('fps:'+ round(gFPS) + ' objs:' + gLastObjCount , 20, 35);
  }

  loadSounds = function () {
    for(var i=0; i < 5; ++i)
      gSounds.push( loadSound('sounds/woodblock' + (i+1) + '.wav') );
  }

  playSound = function (idx) {
    gSounds[idx].play()
  }


  animUpdate = function(animArray, arg) {
    var kill_list = [];
    for (var i = 0; i < animArray.length; ++i) {
      if (animArray[i].update(arg) == false)
        kill_list.push(i);
    }
    for (var i = 0; i < kill_list.length; ++i) {
      animArray.splice(kill_list[i], 1);
    }

    gLastObjCount = animArray.length;
  }

  return { drawFPS:drawFPS, loadSounds:loadSounds, playSound:playSound, animUpdate:animUpdate };
}());
