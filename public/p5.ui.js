// p5.ui.js

// graphical UI elements for p5

ui = (function() {

  //-----------------------
  // global vars
  var gWidgets = [];

  //-----------------------
  // functions
  var removeWidget = function(w) {
    w.remove();
    var index = gWidgets.indexOf(w);
    if (index > -1)
      gWidgets.splice(index, 1);
  }

  var down = function () {
    for (var i = 0; i < gWidgets.length; i++) {
      gWidgets[i].down();
    }
  }

  var up = function () {
    for (var i = 0; i < gWidgets.length; i++) {
      gWidgets[i].up();
    }
  }

  var draw = function () {        
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
    clr = this.enabled ? 0 : 150;
    strokeWeight(0);
    stroke(clr);
    fill(clr);
    text(this.name.toString(), this.x, this.y);
  }

  Button.prototype.down = function() {
    var d2 = Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2);
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
    this.button = new Button(this.name, x, (y+len)/2, 50, clr, this.btnCB.bind(this));
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
      var newY = constrain(mouseY - this.deltaY, this.y, this.y + this.len);
      if (newY != this.button.y) {
        this.button.y = newY;
        this.func(this.name, (this.button.y - this.y) / this.len);
      }
    }
  }

  Slider.prototype.btnCB = function(name, value) {
    if (value == 'down') {
      this.pressed = true;
      this.deltaX = mouseX - this.button.x;
      this.deltaY = mouseY - this.button.y;
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




  return { down:down, up:up, draw:draw, Button:Button, Slider:Slider, removeWidget:removeWidget };

}());
