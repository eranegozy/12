// p5.ui.js

// graphical UI elements for p5

ui = (function() {

  //-----------------------
  // global vars
  var gWidgets = [];
  var pointerX = 0;
  var pointerY = 0;

  //-----------------------
  // functions
  var removeWidget = function(w) {
    w.remove();
    var index = gWidgets.indexOf(w);
    if (index > -1)
      gWidgets.splice(index, 1);
  }

  var down = function (px, py) {
    pointerX = px;
    pointerY = py;
    for (var i = 0; i < gWidgets.length; i++) {
      gWidgets[i].down();
    }
  }

  var up = function (px, py) {
    pointerX = px;
    pointerY = py;
    for (var i = 0; i < gWidgets.length; i++) {
      gWidgets[i].up();
    }
  }

  var draw = function (px, py) {        
    pointerX = px;
    pointerY = py;
    for (var i = 0; i < gWidgets.length; i++) {
      gWidgets[i].draw();
    }
  }

  //--------------------------
  // Button
  //
  var Button = function(name, x, y, r, clr, func) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.r = r;
    this.clr = clr;
    this.func = func;

    this.pressed = false;
    this.enabled = true;

    gWidgets.push(this);
  }

  Button.prototype.draw = function() {
    strokeWeight(2);
    var clr = this.enabled ? this.clr : 150;
    stroke(clr);
    if (this.pressed && this.enabled)
      fill(clr);
    else
      fill(255);
    ellipse(this.x, this.y, this.r*2, this.r*2);

    textAlign(CENTER, CENTER);
    textSize(this.r * 0.7);
    clr = this.enabled ? 0 : 150;
    strokeWeight(0);
    stroke(clr);
    fill(clr);
    text(this.name.toString(), this.x, this.y);
  }

  Button.prototype.down = function() {
    var d2 = Math.pow(pointerX - this.x, 2) + Math.pow(pointerY - this.y, 2);
    if (d2 < (this.r * this.r) && this.enabled) {
      this.pressed = true;
      this.func(this.name, 'down');
    }
  }

  Button.prototype.up = function() {
    if (this.pressed) {
      if (this.enabled)
        this.func(this.name, 'up');
      this.pressed = false;
    }
  }

  Button.prototype.remove = function() {}

  //--------------------------
  // Slider
  //
  var Slider = function(name, x, y, len, clr, func) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.len = len;
    this.func = func;

    this.pressed = false;
    this.enabled = true;

    this.deltaX = 0;
    this.deltaY = 0;

    // draw ourselves before the button we own:
    gWidgets.push(this);
    this.button = new Button(this.name, x, y+len/2, 50, clr, this.btnCB.bind(this));
  }

  Slider.prototype.draw = function() {
    this.button.enabled = this.enabled;
    if (this.pressed && this.enabled)
      strokeWeight(10);
    else
      strokeWeight(2);

    var clr = this.enabled ? 0 : 150;
    stroke(clr);
    line(this.x, this.y, this.x, this.y + this.len);

    // move button position:
    if (this.pressed && this.enabled) {
      var newY = constrain(pointerY - this.deltaY, this.y, this.y + this.len);
      if (newY != this.button.y) {
        this.button.y = newY;
        this.func(this.name, (this.button.y - this.y) / this.len);
      }
    }
  }

  Slider.prototype.btnCB = function(name, value) {
    if (value == 'down') {
      this.pressed = true;
      this.deltaX = pointerX - this.button.x;
      this.deltaY = pointerY - this.button.y;
      this.func(this.name, 'down');
      this.func(this.name, (this.button.y - this.y) / this.len);
    }
    else if (value == 'up') {
      this.pressed = false;
      this.func(this.name, 'up');
    }
  }

  Slider.prototype.remove = function() {
    removeWidget(this.button);
  }

  Slider.prototype.down = function() {}
  Slider.prototype.up = function() {}



  //--------------------------------------------------
  // Grid
  //
  var Grid = function(name, x, y, w, h, clr, func) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.func = func;

    this.pressed = false;
    this.enabled = true;

    this.deltaX = 0;
    this.deltaY = 0;

    // draw ourselves before the button we own:
    gWidgets.push(this);
    this.button = new Button(this.name, x+w/2, y+h/2, 50, clr, this.btnCB.bind(this));
  }

  Grid.prototype.draw = function() {
    this.button.enabled = this.enabled;
    strokeWeight(2);

    var clr = this.enabled ? 0 : 150;
    stroke(clr);
    noFill();
    rect(this.x, this.y, this.w, this.h);

    // move button position:
    if (this.pressed && this.enabled) {
      var newX = constrain(pointerX - this.deltaX, this.x, this.x + this.w);
      var newY = constrain(pointerY - this.deltaY, this.y, this.y + this.h);
      if (newY != this.button.y || newX != this.button.x) {
        this.button.y = newY;
        this.button.x = newX;
        this.func(this.name, [(this.button.x - this.x) / this.w, (this.button.y - this.y) / this.h]);
      }
    }
  }

  Grid.prototype.btnCB = function(name, value) {
    if (value == 'down') {
      this.pressed = true;
      this.deltaX = pointerX - this.button.x;
      this.deltaY = pointerY - this.button.y;
      this.func(this.name, 'down');
      this.func(this.name, [(this.button.x - this.x) / this.w, (this.button.y - this.y) / this.h]);
    }
    else if (value == 'up') {
      this.pressed = false;
      this.func(this.name, 'up');
    }
  }

  Grid.prototype.remove = function() {
    removeWidget(this.button);
  }

  Grid.prototype.down = function() {}
  Grid.prototype.up = function() {}


  //--------------------------------------------------
  // Surface
  // x,y is top-left corner
  var Surface = function(name, x, y, w, h, clr, labels, func) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.clr = clr;

    this.labels = labels
    this.func = func;

    this.lastX = 0;
    this.lastY = 0;

    this.rad = (w+h) * 0.05;

    this.pressed = false;
    this.enabled = true;    
    gWidgets.push(this);
  }

  Surface.prototype.getScreenPos = function() {
    var posX = constrain(pointerX, this.x + this.rad, this.x + this.w - this.rad);
    var posY = constrain(pointerY, this.y + this.rad, this.y + this.h - this.rad);
    return [posX, posY];
  }

  Surface.prototype.getNormPos = function() {
    var pos = this.getScreenPos()

    // scale positions to [0,1]
    return [ (pos[0] - this.x) / this.w, 1 - (pos[1] - this.y) / this.h];
  }

  Surface.prototype.draw = function() {
    // useful locations in this surface:
    var lx = this.x;
    var cx = this.x + this.w / 2;
    var rx = this.x + this.w;
    var ty = this.y;
    var cy = this.y + this.h / 2;
    var by = this.y + this.h;

    // draw border
    rectMode(CENTER);
    imageMode(CENTER);

    strokeWeight(3);
    stroke(0);
    // var bgclr = lerpColor(color(this.clr), color(255, 255, 255, 100), .66);
    // fill(bgclr);
    if (this.enabled) {
      noFill();
    } else
    {
      fill(200);
    }

    rect(cx, cy, this.w, this.h);

    // draw labels:
    noStroke();
    fill(this.enabled?0:150);
    textSize(height * 0.05);

    // top label
    if (this.labels[0]) {
      textAlign(LEFT, TOP);
      text(this.labels[0], lx + 10, ty);
    }

    // center label
    if (1 < this.labels.length) {
      push();
      translate(cx, cy)
      rotate(PI/2);
      textAlign(CENTER, TOP);
      text(this.labels[1], 0, 0);
      pop();

      noFill();
      stroke(this.enabled?0:150);
      strokeWeight(5);
      var mar = height * .05;
      var sideLen = width * 0.05;
      var tp = ty + mar;
      var bp = by - mar;

      var lp = cx - sideLen;
      var rp = cx + sideLen;
      var tp2 = tp + sideLen;
      var bp2 = bp - sideLen;

      // draw arrow      
      line(cx, tp, cx, bp);

      line(cx, tp, lp, tp2);
      line(cx, tp, rp, tp2);

      line(cx, bp, lp, bp2);
      line(cx, bp, rp, bp2);
    }

    // draw volume icons:
    var sz = width/10;
    image(gSpeakerIcons[0], lx + sz, cy, sz, sz);
    image(gSpeakerIcons[1], rx - sz, cy, sz, sz);

    if (!this.enabled) {
      noStroke();
      fill(200, 200);
      rect(lx + sz, cy, sz, sz);
      rect(rx - sz, cy, sz, sz);      
    }

    if (!this.enabled)
      return;

    // draw circle at finger position
    if (this.pressed) {
      var pos = this.getScreenPos();
      fill(this.clr);
      strokeWeight(5);
      var bgclr = lerpColor(color(this.clr), color(0), .2);
      stroke(bgclr);
      ellipse(pos[0], pos[1], this.rad*2, this.rad*2);
    }

    // send msg with cur position
    var pos = this.getNormPos();
    if (this.pressed && (pos[0] != this.lastX || pos[1] != this.lastY)) {
      this.func(this.name, 'xy', pos);
    }
    this.lastX = pos[0];
    this.lastY = pos[1];
  }

  Surface.prototype.remove = function() {
  }

  Surface.prototype.down = function() {
    if (!this.enabled)
      return;

    var xHit = this.x < pointerX && pointerX < this.x + this.w;
    var yHit = this.y < pointerY && pointerY < this.y + this.h;
    // console.log('down(' + this.name + '):' + xHit + ' ' + yHit);
    if (!this.pressed && xHit && yHit) {
      this.pressed = true;
      var pos = this.getNormPos();
      this.func(this.name, "down", pos);
    }
  }

  Surface.prototype.up = function() {
    if (!this.enabled)
      return;

    if (this.pressed) {
      var pos = this.getNormPos();
      this.func(this.name, "up", pos);
    }
    this.pressed = false;
  }

  return { down:down, up:up, draw:draw, Button:Button, Slider:Slider, Grid:Grid, Surface:Surface, removeWidget:removeWidget };

}());
