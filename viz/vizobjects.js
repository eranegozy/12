// vizobjects.js
// visualization / graphics code for *12* project.


var gObjects = [];

/////////////////////////////////////////////////////////
// Star and StarField for background starfield

Star = function(x, y, size, color) {
  this.x = int(x);
  this.y = int(y);
  this.size = int(size);
  this.color = color;
}

StarField = function(x, y, w, h, num) {
  var p = gStarFieldParams;
  this.stars = Array(num);
  for (var i = 0; i < this.stars.length; i++) {
    var clr = lerpColor(p.color1, p.color2, random());
    this.stars[i] = new Star(random(x, x+w), random(y, y+h), random(p.size1, p.size2), clr);
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
  var output = [];

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


StarField.prototype.getNearestButNot = function(cx, cy, notStar) {
  var best_idx = 0;
  var best_dist = 1000000;
  for (var i = 0; i < this.stars.length; i++) {
    var s = this.stars[i];
    var d = dist(cx, cy, s.x, s.y);
    if (d < best_dist && s != notStar) {
      best_dist = d;
      best_idx = i;
    }
  }
  return this.stars[best_idx];
}


/////////////////////////////////////////////////////////
// Flare

Flare = function(x, y) {
  this.x = x;
  this.y = y;
  this.time = 0;
  this.dur = 0.5;
}


Flare.prototype.update = function(dt) {
  var amt = this.time / this.dur;

  push();
  translate(this.x, this.y);
  rotate(this.time * 2);

  // yikes. this takes a long time...
  // tint(255, 200 * (1-amt));

  var sz = 20 * (1-amt);
  image(gStarFieldParams.flareImg, 0, 0, sz, sz);

  pop();

  this.time += dt;
  
  return (this.time < this.dur);
}

/////////////////////////////////////////////////////////
// Ripple 
RippleManager = function(x, y, params, dur) {
  this.x = x
  this.y = y;
  this.params = params;
  this.time = 0;
  this.next_birth = 0;
  this.dur = dur;
}

RippleManager.prototype.release = function() {
  this.dur = 0;
}

RippleManager.prototype.update = function(dt) {
  var p = this.params;

  if (this.next_birth < this.time) {
    gObjects.push(new Ripple(this.x, this.y, p));    
    this.next_birth = this.time + p.birthRate;
  }

  this.time += dt;
  var active = this.time < this.dur;
  return active;
}


Ripple = function(x, y, params) {
  this.x = x
  this.y = y;
  this.params = params;
  this.time = 0;
}

Ripple.prototype.update = function(dt) {
  var p = this.params;
  var amt = this.time / p.dur;

  var weight = lerp(p.weightStart, p.weightEnd, amt);
  var color = lerpColor(p.startColor, p.endColor, amt);
  var size = lerp(p.sizeStart, p.sizeEnd, amt);

  noFill();
  strokeWeight(weight);
  stroke(color);
  ellipse(this.x, this.y, size, size);

  this.time += dt;

  return (this.time < p.dur);
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
  var amt = this.time / p.dur;

  var color = lerpColor(p.startColor, p.endColor, amt);
  var size = lerp(p.sizeStart, p.sizeEnd, amt);

  fill(color);
  noStroke();    
  ellipse(this.x, this.y, size, size);

  this.time += dt;
  
  return (this.time < p.dur);
}

/////////////////////////////////////////////////////////
// Thread line drawing

ThreadManager = function(x, y, params, dur) {
  this.x = x
  this.y = y;
  this.params = params;
  this.time = 0;
  this.next_birth = 0;
  this.dur = dur;
}

ThreadManager.prototype.release = function() {
  this.dur = 0;
}

ThreadManager.prototype.update = function(dt) {
  var p = this.params;

  if (this.next_birth <= this.time) {
    var numSpawn = this.time == 0 ? p.initSpawn : 1;
    for (var i = 0; i < numSpawn; i++) {
      gObjects.push(new Thread(this.x, this.y, p, p.initLifespan));    
    };
    this.next_birth = this.time + p.birthRate;
  }

  this.time += dt;
  var active = this.time < this.dur;
  return active;
}


Thread = function(x, y, params, lifespan) {
  this.x = x;
  this.y = y;
  this.params = params;

  this.theta = random(TWO_PI);
  this.thetaN = random(10);
  this.time = 0;
  this.lifespan = lifespan
  this.spawnTime = .05 + random(0.1,0.6) * lifespan;
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
  var clr = lerpColor(p.startColor, p.endColor, this.time/this.lifespan);
  stroke(clr);
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

Const = function(x, y, params, starfield, dur) {
  this.x = x
  this.y = y;
  this.params = params;
  this.dur = dur
  this.time = 0;

  var star = starfield.getNearest(x, y);
  this.lines = [];
  
  // TODO - tunes these to make larger, espcially if going offscreen
  addConstPolygon(star, int(random(3,6)), 60, starfield, this.lines);
  addConstPath(star, 3, -10, -30, starfield, this.lines);
  addConstPath(star, 3, 10, 30, starfield, this.lines);

  // find the unique set of stars
  this.stars = [];
  for (var i = 0; i < this.lines.length; i++) {
    var s = this.lines[i][0];
    if (this.stars.indexOf(s) == -1)
      this.stars.push(s);
    s = this.lines[i][1];
    if (this.stars.indexOf(s) == -1)
      this.stars.push(s);
  };

  // immediate flare on each
  for (var i = 0; i < this.stars.length; i++) {
    var s = this.stars[i];
    gObjects.push(new Flare(s.x, s.y));
  };
}

Const.prototype.release = function() {
  this.dur = this.params.appear_dur;
}

Const.prototype.update = function(dt) {
  var p = this.params;
  var amt = constrain(this.time / p.appear_dur, 0, 1);

  noFill();

  var noiseX = (10 +this.time) * 5;

  lineAmt = 0.5 + 0.5 * amt; // 0.5 -> 1.0 
  for (var i = 0; i < this.lines.length; i++) {
    var s1 = this.lines[i][0];
    var s2 = this.lines[i][1];
    var x1 = lerp(s1.x, s2.x, lineAmt);
    var y1 = lerp(s1.y, s2.y, lineAmt);
    var x2 = lerp(s2.x, s1.x, lineAmt);
    var y2 = lerp(s2.y, s1.y, lineAmt);

    clr = lerpColor(p.color1, p.color2, noise(noiseX));
    noiseX += 0.1;

    // do some fake anti-aliasing of the line
    strokeWeight(p.weight + 2);
    var r = red(clr);
    var g = green(clr);
    var b = blue(clr);

    stroke(r,g,b,30);
    line(x1, y1, x2, y2);

    strokeWeight(p.weight);
    stroke(clr);
    line(x1, y1, x2, y2);

  };

  if (random() < 0.05) {
    var idx = int(floor(random(this.stars.length)));
    var s = this.stars[idx];
    gObjects.push(new Flare(s.x, s.y));
  }

  this.time += dt;

  var active = this.time < this.dur;

  return active;
}

addConstPath = function(star, segs, dx, dy, starfield, lines) {
  var pStar = star;
  for (var i = 0; i < segs; i++) {
    var nStar = starfield.getNearestButNot(pStar.x + dx, pStar.y + dy, pStar);
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
    var nStar = starfield.getNearestButNot(pStar.x + dx, pStar.y + dy, pStar);
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
// SpikeEmitter drawing

Spike = function(x, y, dx, dy, params, clr) {
  this.x1 = x;
  this.y1 = y;
  this.x2 = x + dx * 100 + random(-params.length_var, params.length_var);
  this.y2 = y + dy * 100 + random(-params.length_var, params.length_var);
  this.vx = params.speed + random(-this.speed_var, this.speed_var);
  this.vy = params.speed + random(-this.speed_var, this.speed_var);;


  this.x2 = x + dx * params.spike_len + random(-1, 1) * params.length_var;
  this.y2 = y + dy * params.spike_len + random(-1, 1) * params.length_var;
  this.vx = dx * params.speed + random(-params.speed_var, params.speed_var);
  this.vy = dy * params.speed + random(-params.speed_var, params.speed_var);

  this.clr = clr;
}

Spike.prototype.update = function(dt) {
  dx = this.vx * dt;
  dy = this.vy * dt;

  this.x1 += dx;
  this.x2 += dx;
  this.y1 += dy;
  this.y2 += dy;

  stroke(this.clr);
  line(this.x1, this.y1, this.x2, this.y2);

  if (this.x1 > width) return false;
  if (this.x1 < 0) return false;
  if (this.y1 > height) return false;
  if (this.y1 < 0) return false;
  return true;
}


SpikeEmitter = function(x, y, params, dur) {
  this.x = x;
  this.y = y;
  this.params = params;
  this.time = 0;
  this.dur = dur
  this.shadow = 1.5;

  // choose direction:
  var dir_options = [];
  if (x > width * .3)
    dir_options.push([-1, 0]);
  if (x < width * .7)
    dir_options.push([1, 0]);
  if (y > height * .3)
    dir_options.push([0, -1]);
  if (y < height * .7)
    dir_options.push([0, 1]);
  
  var dir_idx = floor(random(dir_options.length));
  var dir = dir_options[dir_idx]
  this.dx = dir[0];
  this.dy = dir[1];

  this.spikes = Array(params.maxSpikes);
  for (var i=0; i < this.spikes.length; ++i) {
    this.spikes[i] = null;
  }
  this.numSpikes = 0;

  gObjects.push(new Flare(this.x, this.y));
}

SpikeEmitter.prototype.release = function() {
  this.dur = this.time;
}

SpikeEmitter.prototype.update = function(dt) {
  var p = this.params;

  // birth new spikes while we are active
  var newSpikes = 0;
  var active = this.time < this.dur + this.shadow;
  
  if (active)
    newSpikes = 1;

  strokeWeight(p.weight);
  for (var i=0; i < this.spikes.length; ++i) {
    // found a spike:
    if (this.spikes[i]) {
      if (this.spikes[i].update(dt) == false) {
        this.spikes[i] = null;
        this.numSpikes--;
      }
    }

    else if (newSpikes > 0) {
      // create a new spike:
      var clr = lerpColor(p.color1, p.color2, noise(this.time * 3));
      if (random() < 0.1) {
        clr = color(250, 250, 250, 150);
      }

      if (this.time > this.dur) {
        var a = alpha(clr) * .05;
        var r = red(clr);
        var g = green(clr);
        var b = blue(clr);
        clr = color(r, g, b, a);
      }
      else {
        if (random() < 0.1) {
          gObjects.push(new Flare(this.x, this.y));
        }
      }

      this.spikes[i] = new Spike(this.x, this.y, this.dx, this.dy, p, clr);
      this.numSpikes++;
      newSpikes--;
    }
  }


  this.time += dt;

  // stop when no more spikes are visible
  return active || this.numSpikes > 0;
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

makeNewThread = function(x, y, burstParams, threadParams, dur) {
  gObjects.push(new Burst(x, y, burstParams));
  var obj = new ThreadManager(x, y, threadParams, dur);
  gObjects.push(obj);
  return obj;
}

makeNewRipple = function(x, y, params, dur) {
  var obj = new RippleManager(x, y, params, dur);
  gObjects.push(obj);
  return obj;
}

makeNewConst = function(x, y, params, starfield, dur) {
  var obj = new Const(x, y, params, starfield, dur);
  gObjects.push(obj);
  return obj;
}

makeNewSpike = function(x, y, params, dur) {
  var obj = new SpikeEmitter(x, y, params, dur);
  gObjects.push(obj);
  return obj;
}
