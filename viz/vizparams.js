// vizparams.js

//----------------------------------------
// StarField PARAMETERS
StarFieldParams = function() {
  this.color1  = color(255,144,144,255);
  this.color2  = color(83,144,255, 255);
  this.size1   = 2;
  this.size2   = 5;
  this.flareImg = loadImage('StarSparkle02.png');
}

setStarFieldParams = function() {
  gStarFieldParams = new StarFieldParams();
}

//----------------------------------------
// Ripple PARAMETERS
RippleParams = function() {
  this.sizeStart = 10;
  this.sizeEnd   = 430;
  this.weightStart = 4;
  this.weightEnd  = 1;
  this.dur       = 1.5;
  this.birthRate = 0.15;
  this.startColor = color(83,144,144,255);
  this.endColor   = color(83,144,144, 0);
}

setRippleParams = function() {
  gNumStars = 240;
  gGlobalFade = 200; // how quickly things fade out

  gRippleParams = [];
  gRippleParams[0] = new RippleParams();
  gRippleParams[1] = new RippleParams();
  gRippleParams[2] = new RippleParams();

  // override default values for player 1 
  gRippleParams[1].startColor = color(239, 206, 139, 255);
  gRippleParams[1].endColor   = color(239, 206, 139, 0);


  // override default values for player 2 
  gRippleParams[2].startColor = color(239,  139, 139, 255);
  gRippleParams[2].endColor   = color(239,  139, 139, 0);
}


//----------------------------------------
// Thread PARAMETERS
BurstParams = function() {
  this.sizeStart  = 20;
  this.sizeEnd    = 50;
  this.dur        = .15;
  this.startColor = color(255, 50, 50, 255);
  this.endColor   = color(255, 50, 50, 0);
}

ThreadParams = function() {
  this.birthRate = .25;
  this.initLifespan = 1;
  this.initSpawn = 3;
  this.curvy = .5;
  this.speed = 2;
  this.weight = 2;
  this.startColor = color(255, 50, 50, 255);
  this.endColor   = color(255, 250, 50, 255);
}

setThreadParams = function() {
  gNumStars = 250;
  gGlobalFade = 20; // how quickly things fade out

  gBurstParams = [];
  gBurstParams[0] = new BurstParams();
  gBurstParams[1] = new BurstParams();
  gBurstParams[2] = new BurstParams();

  gThreadParams = [];
  gThreadParams[0] = new ThreadParams();
  gThreadParams[1] = new ThreadParams();
  gThreadParams[2] = new ThreadParams();

  // override default values for player 1
  gBurstParams[1].startColor  = color(50, 255, 50, 255);
  gBurstParams[1].endColor    = color(50, 255, 50, 0);
  gThreadParams[1].startColor = color(50, 255, 50, 255);
  gThreadParams[1].endColor   = color(150, 255, 50, 255);

  // override default values for player 2
  gBurstParams[2].startColor  = color(100, 100, 255, 255);
  gBurstParams[2].endColor    = color(100, 100, 255, 0);
  gThreadParams[2].startColor = color(100, 100, 255, 255);
  gThreadParams[2].endColor   = color(100, 200, 255, 255);
}


//----------------------------------------
// Constellation PARAMETERS:
ConstParams = function() {
  this.weight = 2;
  this.appear_dur = .2;
  this.color1 = color(255, 0, 0);
  this.color2 = color(255,  255, 255);
}

setConstParams = function() {
  gNumStars = 360;
  gGlobalFade = 10; // how quickly things fade out

  gConstParams = [];
  gConstParams[0] = new ConstParams();
  gConstParams[1] = new ConstParams();
  gConstParams[2] = new ConstParams();

  // override default values for players 1 and 2
  gConstParams[1].color1 = color(0, 150, 0);
  gConstParams[1].color2 = color(255,  255, 255);

  gConstParams[2].color1 = color(50, 50, 250);
  gConstParams[2].color2 = color(255,  255, 255);
}


//----------------------------------------
// Spike PARAMETERS
SpikeParams = function() {
  this.weight = 1;
  this.maxSpikes = 100;
  this.spike_len = 200;
  this.length_var = 10;
  this.speed = 1000;
  this.speed_var = 10;
  this.color1 = color(200, 50, 50, 150);
  this.color2 = color(200, 200, 50, 150);
}

setSpikeParams = function() {
  gNumStars = 240;
  gGlobalFade = 20; // how quickly things fade out

  gSpikeParams = [];
  gSpikeParams[0] = new SpikeParams();
  gSpikeParams[1] = new SpikeParams();
  gSpikeParams[2] = new SpikeParams();

  // override default values for players 1 and 2
  gSpikeParams[1].color1 = color(50, 250, 50, 150);
  gSpikeParams[1].color2 = color(50, 200, 200, 150);

  gSpikeParams[2].color1 = color(50, 50, 250, 150);
  gSpikeParams[2].color2 = color(200, 50, 200, 150);
}


//----------------------------------------
// Null PARAMETERS
setNullParams = function() {
  gNumStars = 240;
  gGlobalFade = 100; // how quickly things fade out
}
