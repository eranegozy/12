// vizparams.js


//----------------------------------------
// Ripple PARAMETERS
RippleParams = function() {
  this.sizeStart = 10;
  this.sizeEnd   = 130;
  this.weightStart = 4;
  this.weightEnd  = 1;
  this.len = 0.5;
  this.birthRate = 0.15;
  this.numChildren = 2;
  this.startColor = color(255,255,255,255);
  this.endColor   = color(100,200,50, 0);
}

setRippleParams = function() {
  gNumStars = 240;
  gGlobalFade = 200; // how quickly things fade out

  gRippleA = new RippleParams();
  gRippleB = new RippleParams();
  gRippleC = new RippleParams();

  // override default values for B and C
  gRippleB.endColor = color(200, 50, 75, 0);
  gRippleC.endColor = color(0,  50, 205, 0);
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
  this.initLifespan = 2;
  this.curvy = .4;
  this.speed = 2;
  this.weight = 2;
  this.color = color(255, 50, 50, 255);
}

setThreadParams = function() {
  gNumStars = 250;
  gGlobalFade = 20; // how quickly things fade out

  // setting up for different parameters for A, B, C
  gBurstA = new BurstParams();
  gBurstB = new BurstParams();
  gBurstC = new BurstParams();

  gThreadA = new ThreadParams();
  gThreadB = new ThreadParams();
  gThreadC = new ThreadParams();

  // override B parameters
  gBurstB.startColor = color(50, 255, 50, 255);
  gBurstB.endColor   = color(50, 255, 50, 0);
  gThreadB.color     = color(50, 255, 50, 255);

  // override C parameters
  gBurstC.startColor = color(100, 100, 255, 255);
  gBurstC.endColor   = color(100, 100, 255, 0);
  gThreadC.color     = color(100, 100, 255, 255);
}


//----------------------------------------
// Constellation PARAMETERS:
ConstParams = function() {
  this.len = .2;
  this.color = color(200, 255, 200);
}

setConstParams = function() {
  gNumStars = 360;
  gGlobalFade = 10; // how quickly things fade out

  gConstA = new ConstParams();
  gConstB = new ConstParams();
  gConstC = new ConstParams();

  // override default values for B and C
  gConstB.color = color(200, 50, 75);
  gConstC.color = color(0,  50, 215);
}
