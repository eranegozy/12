// vizparams.js

//----------------------------------------
// StarField PARAMETERS
StarFieldParams = function() {
  this.color1  = color(251, 237, 209, 200);
  this.color2  = color(163, 186, 248, 255);
  this.size1   = 2;
  this.size2   = 5;
  this.flareImg = loadImage('StarSparkle05.png');
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
  this.endColor   = color(81,123,171, 0);
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
  gRippleParams[1].endColor   = color(253, 223, 121, 0);


  // override default values for player 2 
  gRippleParams[2].startColor = color(239,  139, 139, 255);
  gRippleParams[2].endColor   = color(253,  171, 129, 0);
}


//----------------------------------------
// Thread PARAMETERS
BurstParams = function() {
  this.sizeStart  = 20;
  this.sizeEnd    = 50;
  this.dur        = .15;
  this.startColor = color(83, 144, 144, 255);
  this.endColor   = color(81, 123, 171, 0);
}

ThreadParams = function() {
  this.birthRate = .15;
  this.initLifespan = 1.2;
  this.initSpawn = 3;
  this.curvy = .5;
  this.speed = 2.5;
  this.weight = 2;
  this.startColor = color(81+80, 123+80, 171+80, 255);
  this.endColor   = color(83+20, 144+20, 144+20, 255);
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
  gBurstParams[1].startColor  = color(239, 206, 139, 255);
  gBurstParams[1].endColor    = color(253, 223, 121, 0);
  gThreadParams[1].startColor = color(253, 223, 121, 255);
  gThreadParams[1].endColor   = color(239, 206, 139, 255);

  // override default values for player 2
  gBurstParams[2].startColor  = color(239, 139, 139, 255);
  gBurstParams[2].endColor    = color(253, 172, 129, 0);
  gThreadParams[2].startColor = color(253, 172, 129, 255);
  gThreadParams[2].endColor   = color(239, 139, 139, 255);
}


//----------------------------------------
// Constellation PARAMETERS:
ConstParams = function() {
  this.weight = 2;
  this.appear_dur = .2;
  this.color1 = color(83, 144, 144);
  // this.color2 = color(81, 123, 171);
  this.color2 = color(255);
}

setConstParams = function() {
  gNumStars = 400;
  gGlobalFade = 10; // how quickly things fade out

  gConstParams = [];
  gConstParams[0] = new ConstParams();
  gConstParams[1] = new ConstParams();
  gConstParams[2] = new ConstParams();

  // override default values for players 1 and 2
  gConstParams[1].color1 = color(239, 206, 139);
  // gConstParams[1].color2 = color(253, 223, 121);

  gConstParams[2].color1 = color(239, 139, 139);
  // gConstParams[2].color2 = color(253, 172, 129);
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
  this.color1 = color(83, 144, 144, 150);
  this.color2 = color(81, 123, 171, 150);
}

setSpikeParams = function() {
  gNumStars = 240;
  gGlobalFade = 20; // how quickly things fade out

  gSpikeParams = [];
  gSpikeParams[0] = new SpikeParams();
  gSpikeParams[1] = new SpikeParams();
  gSpikeParams[2] = new SpikeParams();

  // override default values for players 1 and 2
  gSpikeParams[1].color1 = color(239, 206, 139, 150);
  gSpikeParams[1].color2 = color(253, 223, 121, 150);

  gSpikeParams[2].color1 = color(239, 139, 139, 150);
  gSpikeParams[2].color2 = color(253, 172, 129, 150);
}


//----------------------------------------
// Null PARAMETERS
setNullParams = function() {
  gNumStars = 240;
  gGlobalFade = 200; // how quickly things fade out
}
