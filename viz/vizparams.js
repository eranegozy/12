// vizparams.js


//----------------------------------------
// Ripple PARAMETERS
RippleParams = function() {
  this.sizeStart = 10;
  this.sizeEnd   = 430;
  this.weightStart = 4;
  this.weightEnd  = 1;
  this.dur       = 1.5;
  this.birthRate = 0.15;
  this.startColor = color(255,255,255,255);
  this.endColor   = color(100,200,50, 0);
}

setRippleParams = function() {
  gNumStars = 240;
  gGlobalFade = 200; // how quickly things fade out

  gRippleParams = [];
  gRippleParams[0] = new RippleParams();
  gRippleParams[1] = new RippleParams();
  gRippleParams[2] = new RippleParams();

  // override default values for players 1 and 2
  gRippleParams[1].endColor = color(200, 50, 75, 0);
  gRippleParams[2].endColor = color(0,  50, 205, 0);
}


//----------------------------------------
// Thread PARAMETERS
BurstParams = function() {
  this.sizeStart  = 20;
  this.sizeEnd    = 50;
  this.len        = .04;
  this.startColor = color(255, 50, 50, 255);
  this.endColor   = color(255, 50, 50, 0);
}

ThreadParams = function() {
  this.birthRate = .25;
  this.initLifespan = 1;
  this.initSpawn = 3;
  this.curvy = .4;
  this.speed = 2;
  this.weight = 2;
  this.color = color(255, 50, 50, 255);
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
  gBurstParams[1].startColor = color(50, 255, 50, 255);
  gBurstParams[1].endColor   = color(50, 255, 50, 0);
  gThreadParams[1].color     = color(50, 255, 50, 255);

  // override default values for player 2
  gBurstParams[2].startColor = color(100, 100, 255, 255);
  gBurstParams[2].endColor   = color(100, 100, 255, 0);
  gThreadParams[2].color     = color(100, 100, 255, 255);
}


//----------------------------------------
// Constellation PARAMETERS:
ConstParams = function() {
  this.appear_dur = .2;
  this.color = color(200, 255, 200);
}

setConstParams = function() {
  gNumStars = 360;
  gGlobalFade = 10; // how quickly things fade out

  gConstParams = [];
  gConstParams[0] = new ConstParams();
  gConstParams[1] = new ConstParams();
  gConstParams[2] = new ConstParams();

  // override default values for players 1 and 2
  gConstParams[1].color = color(200, 50, 75);
  gConstParams[2].color = color(0,  50, 215);
}


//----------------------------------------
// Spike PARAMETERS
SpikeParams = function() {
  this.weight = 1;
  this.maxSpikes = 100;
  this.color = color(200, 50, 50, 150);
}

setSpikeParams = function() {
  gNumStars = 240;
  gGlobalFade = 20; // how quickly things fade out

  gSpikeParams = [];
  gSpikeParams[0] = new SpikeParams();
  gSpikeParams[1] = new SpikeParams();
  gSpikeParams[2] = new SpikeParams();

  // override default values for players 1 and 2
  gSpikeParams[1].color = color(50, 250, 50, 150);
  gSpikeParams[2].color = color(50, 50, 250, 150);
}


//----------------------------------------
// Null PARAMETERS
setNullParams = function() {
  gNumStars = 240;
  gGlobalFade = 100; // how quickly things fade out
}
