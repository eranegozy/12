// p5.ui.js

// graphical UI elements for p5

ui = (function() {

  // global vars
  var gWidgets = [];

  var Button = function(name, x, y, r, clr, func) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.r = r;
    this.clr = clr;
    this.func = func;

    this.pressed = false;

    gWidgets.push(this);
  }

  Button.prototype.draw = function() {
    strokeWeight(2);
    stroke(this.clr);
    if (this.pressed)
      fill(this.clr);
    else
      noFill();
    ellipse(this.x, this.y, this.r*2, this.r*2);
  }

  Button.prototype.down = function() {
    var d2 = Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2);
    if (d2 < (this.r * this.r)) {
      this.pressed = true;
      this.func(this.name, true);
    }
  }

  Button.prototype.up = function() {
    if (this.pressed) {
      this.func(this.name, false);
      this.pressed = false;
    }
  }

  var Slider = function(name, x, y, len, clr, func) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.len = len;
    this.func = func;

    this.pressed = false;
    this.deltaX = 0;
    this.deltaY = 0;
    this.lastBtnX = 0;

    // draw ourselves before the button we own:
    gWidgets.push(this);
    this.button = new Button('sb', x, y, 50, clr, this.btnCB.bind(this));
  }

  Slider.prototype.draw = function() {
    if (this.pressed)
      strokeWeight(10);
    else
      strokeWeight(2);

    stroke(100);
    line(this.x, this.y, this.x + this.len, this.y);

    // move button position:
    if (this.pressed) {
      var newX = constrain(mouseX - this.deltaX, this.x, this.x + this.len);
      if (newX != this.button.x) {
        this.button.x = newX;
        this.func(this.name, (this.button.x - this.x) / this.len);
      }
      
    }
  }

  Slider.prototype.btnCB = function(name, value) {
    if (value == true) {
      this.pressed = true;
      this.deltaX = mouseX - this.button.x;
      this.deltaY = mouseY - this.button.y;
      this.func(this.name, true);
      this.func(this.name, (this.button.x - this.x) / this.len);
    }
    else if (value == false) {
      this.pressed = false;
      this.func(this.name, false);
    }
  }

  Slider.prototype.down = function() {
  }

  Slider.prototype.up = function() {
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

  return { down:down, up:up, draw:draw, Button:Button, Slider:Slider};

}());
