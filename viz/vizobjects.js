// vizobjects.js
// visualization / graphics code for *12* project.


var gObjects = [];

/////////////////////////////////////////////////////////
// Star and StarField for background starfield

Star = function(x, y, size, color) {
  this.x = int(x);
  this.y = int(y);
  this.size = int(size);
  this.color = int(color);
}

StarField = function(x, y, w, h, num) {
  this.stars = Array(num)
  for (var i = 0; i < this.stars.length; i++) {
    clr = random(150, 255);
    this.stars[i] = new Star(random(x, x+w), random(y, y+h), random(2, 5), clr);
  };
}

StarField.prototype.draw = function() {
  // draw each star
  noStroke(1);
  for (var i = 0; i < this.stars.length; i++) {
    var s = this.stars[i];
    fill(s.color);
    ellipse(s.x, s.y, s.size, s.size);
  }
}

StarField.prototype.getRandomPoint = function() {
  var idx = int(random(this.stars.length));
  var s = this.stars[idx];
  return [s.x, s.y];
}

StarField.prototype.getNeighbors = function(cx, cy, size) {
  output = [];

  for (var i = 0; i < this.stars.length; i++) {
    var s = this.stars[i];
    var d = dist(cx, cy, s.x, s.y);
    if (d < size) {
      output.push(s);
    }
  }
  return output;
}

StarField.prototype.getNearest = function(cx, cy) {
  var best_idx = 0;
  var best_dist = 1000000;
  for (var i = 0; i < this.stars.length; i++) {
    var s = this.stars[i];
    var d = dist(cx, cy, s.x, s.y);
    if (d < best_dist) {
      best_dist = d;
      best_idx = i;
    }
  }
  return this.stars[best_idx];
}


/////////////////////////////////////////////////////////
// Ripple 

Ripple = function(x, y, num, params) {
  this.x = x
  this.y = y;
  this.num = num;
  this.params = params;
  this.time = 0;
}

Ripple.prototype.update = function(dt) {
  var p = this.params;
  var amt = this.time / p.len;

  var weight = lerp(p.weightStart, p.weightEnd, amt);
  var color = lerpColor(p.startColor, p.endColor, amt);
  var size = lerp(p.sizeStart, p.sizeEnd, amt);

  noFill();
  strokeWeight(weight);
  stroke(color);
  ellipse(this.x, this.y, size, size);

  this.time += dt;

  if (this.num > 0 && this.time > p.birthRate) {
    gObjects.push(new Ripple(this.x, this.y, this.num-1, p));
    this.num = 0;
  }

  return (this.time < p.len);
}


/////////////////////////////////////////////////////////
// Burst

Burst = function(x, y, params) {
  this.x = x;
  this.y = y;
  this.params = params;
  this.time = 0;
}

Burst.prototype.update = function(dt) {
  var p = this.params;
  var amt = this.time / p.len;

  var color = lerpColor(p.startColor, p.endColor, amt);
  var size = lerp(p.sizeStart, p.sizeEnd, amt);

  fill(color);
  noStroke();    
  ellipse(this.x, this.y, size, size);

  this.time += dt;
  
  return (this.time < p.len);
}

/////////////////////////////////////////////////////////
// Thread line drawing

Thread = function(x, y, params, lifespan) {
  this.x = x;
  this.y = y;
  this.params = params;

  this.theta = random(TWO_PI);
  this.thetaN = random(10);
  this.time = 0;
  this.lifespan = lifespan
  this.spawnTime = .05 + random(0.2,0.4) * lifespan;
}

Thread.prototype.update = function(dt) {
  var p = this.params;

  // update theta with perlin noise:
  this.theta += p.curvy * PI * (noise(this.thetaN) - 0.5);
  // this.theta += 0.55 * PI * (random() - 0.5);

  var step = p.speed;
  var newX = this.x + cos(this.theta) * step;
  var newY = this.y + sin(this.theta) * step;

  // draw line
  stroke(p.color);
  strokeWeight(p.weight);    
  noFill();

  line(this.x, this.y, newX, newY);
  this.x = newX;
  this.y = newY;

  // spawn a new thread from current location.
  if (this.spawnTime < this.time)
  {
    gObjects.push(new Thread(this.x, this.y, p, this.lifespan*0.75));
    this.spawnTime = 100;
  }

  this.thetaN += 0.25;
  this.time += dt;

  return this.time < this.lifespan;
}

/////////////////////////////////////////////////////////
// Const - constellation object

Const = function(x, y, params, starfield) {
  this.x = x
  this.y = y;
  this.params = params;
  this.time = 0;
  var star = starfield.getNearest(x, y);
  this.lines = [];
  addConstPolygon(star, int(random(3,6)), 60, starfield, this.lines);
  addConstPath(star, 3, -10, -30, starfield, this.lines);
  addConstPath(star, 3, 10, 30, starfield, this.lines);
}

Const.prototype.update = function(dt) {
  var p = this.params;
  var amt = this.time / p.len;

  noFill();
  strokeWeight(2);
  stroke(p.color);

  lineAmt = 0.5 + 0.5 * amt; // 0.5 -> 1.0 
  for (var i = 0; i < this.lines.length; i++) {
    var s1 = this.lines[i][0];
    var s2 = this.lines[i][1];
    var x1 = lerp(s1.x, s2.x, lineAmt);
    var y1 = lerp(s1.y, s2.y, lineAmt);
    var x2 = lerp(s2.x, s1.x, lineAmt);
    var y2 = lerp(s2.y, s1.y, lineAmt);
    line(x1, y1, x2, y2);
  };

  this.time += dt;

  return (this.time < p.len);
}

addConstPath = function(star, segs, dx, dy, starfield, lines) {
  var pStar = star;
  for (var i = 0; i < segs; i++) {
    var nStar = starfield.getNearest(pStar.x + dx, pStar.y + dy);
    lines.push([pStar, nStar]);
    pStar = nStar;
  }
}

addConstPolygon = function(star, sides, len, starfield, lines) {
  var pStar = star;
  var dx = len;
  var dy = 0;
  var theta = TWO_PI / sides;
  var cosTheta = cos(theta);
  var sinTheta = sin(theta);

  for (var i = 0; i < sides-1; i++) {
    var nStar = starfield.getNearest(pStar.x + dx, pStar.y + dy);
    lines.push([pStar, nStar]);

    pStar = nStar;
    var dx1 = dx * cosTheta - dy * sinTheta;
    var dy1 = dx * sinTheta + dy * cosTheta;
    dx = dx1;
    dy = dy1;
  }
  lines.push([pStar, star]);
}


/////////////////////////////////////////////////////////
// factories:

makeStarFields = function(numSlots, numStars) {
  output = new Array(numSlots);

  for (var s = 0; s < numSlots; s++) {
    w = int(width/numSlots);
    x = s * w;
    output[s] = new StarField(x,0,w,height, int(numStars/numSlots));
  }

  return output;
}

makeNewThread = function(x, y, burstParams, threadParams) {
  gObjects.push(new Burst(x, y, burstParams));  
  gObjects.push(new Thread(x, y, threadParams, threadParams.initLifespan));
  gObjects.push(new Thread(x, y, threadParams, threadParams.initLifespan));
  gObjects.push(new Thread(x, y, threadParams, threadParams.initLifespan));
}

makeNewRipple = function(x, y, params) {
  gObjects.push(new Ripple(x, y, params.numChildren, params));
}

makeNewConst = function(x, y, params, starfield) {
  gObjects.push(new Const(x, y, params, starfield));
}


