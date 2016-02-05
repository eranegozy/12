//
// Node.js main app for *12* server
//

var express = require('express');
var cookieParser = require('cookie-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var osc = require('node-osc');


var gMaxSender;
var gOscListenPort = 12346;
var gOscServer;

var gPlayers = [];

var gSongData = { 
  name: "*12*",
  sections: [
    { name: "ScorpioTest 1",
      instruments: [
        {name:'woodblock', type:'buttons', size:1},
        {name:'guiro', type:'1d', size:2},
        {name:'piano', type:'1d', size:2}]},

    { name:"ScorpioTest 2",
      instruments: [
        {name:'woodblock', type:'buttons', size:5},
        {name:'guiro', type:'1d', size:2},
        {name:'piano', type:'1d', size:2}]},

    { name:"ScorpioTest 3",
      instruments: [
        {name:'woodblock', type:'2d'},
        {name:'guiro', type:'1d', size:2},
        {name:'piano', type:'1d', size:2}]},
  ]
};

// create public access to files
app.use(express.static('public'));
app.use(express.static('viz'));
app.use(cookieParser());

// this serves up a page of html for the instrument when a request comes in.
app.get('/', function(req, res) {
  console.log("cookies:", req.cookies);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// this serves up a page of html for the conductor page.
app.get('/cond', function(req, res) {
  res.sendFile(path.join(__dirname, 'cond_index.html'));
});

// this serves up a page for the visual display
app.get('/viz', function(req, res) {
  console.log('requesting visuals');
  res.sendFile(path.join(__dirname, 'viz_index.html'));
});


// this serves up a page of html for the conductor page.
app.get('/m', function(req, res) {
  console.log('requesting mobile');
  res.sendFile(path.join(__dirname, 'mobile_index.html'));
});



var startup = function () 
{
  console.log("Node.js version is:", process.version);
  setInterval(onIntervalCB, 1000);
}


var onIntervalCB = function () 
{
  // console.log("onIntervalCB");
  if (gMaxSender)
  {
    // send hearbeat to max so we know connection is alive.
    gMaxSender.send('/heart')
  }
}


// what port to listen on for this http server:
var server = http.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Http: listening at', host, port);

  // listen to OSC messages (which come from Max/Msp)
  gOscServer = new osc.Server(gOscListenPort, '0.0.0.0');
  console.log('OSC: listening at', gOscListenPort);

  // receive messages from max, tagged as /max
  gOscServer.on('message', function(msg, rinfo) {
    console.log(msg, rinfo);
    if (msg[0] == '/max')
      onMaxMsg(msg);
  });
});


//------------------------------------
// Connection to Max
//

// TODO - must retain all max state so that if it crashes and gets restarted,
// all current state can be sent to it right away. To make it general, maybe
// all msgs sent to max with slashes are all hashed. So the most recent /inst/1
// is remembered...

var onMaxMsg = function(msg)
{
  if (msg[1] == 'hello') {
    var ip = msg[2]
    var port = msg[3]
    console.log("creating gMaxSender to", ip, port);
    if (gMaxSender)
      gMaxSender.kill();
    gMaxSender = new osc.Client(ip, port);
    sendMaxCondData();

  }

  else if (msg[1] == 'bye') {
    if (gMaxSender)
    {
      console.log("removing gMaxSender");
      gMaxSender.kill();
      gMaxSender = null;
    }
  }

  else if (msg[1] == 'note') {
    console.log("note from Max");
    var noteMsg = {playerIdx: msg[2], note:msg[3]}
    gVizNS.emit('note', noteMsg);
  }
}


var sendMaxCondData = function() {
  if (gMaxSender) 
  {
    idx = gCondData.sectionIdx == null ? 'null' : gCondData.sectionIdx;
    gMaxSender.send('/sectionIdx', [idx]);
  }
}

var sendToMax = function(tag, msg) {
  console.log('toMax', tag, msg);
  if (gMaxSender)
    gMaxSender.send(tag, msg)
}


//------------------------------------
// Connection to Conductor
//
var gCondData =
{
  'sectionIdx': null,
}

var gCondNS = io.of('/cond');
gCondNS.on('connection', function(socket) {
  console.log('Conductor connected');
  socket.emit('allData', [gSongData, gPlayers, gCondData]);

  socket.on('disconnect', function() {
    console.log('Conductor disconnected');
  });

  socket.on('set', function(msg) {
    console.log(msg);
    var key = msg[0];
    gCondData[key] = msg[1];
    gCondNS.emit('condData', gCondData);
    gPlayerNS.emit('condData', gCondData);
    gVizNS.emit('condData', gCondData);
    sendMaxCondData();
  });
});


//------------------------------------
// Connection to Vizulization
//
var gVizNS = io.of('/viz');
gVizNS.on('connection', function(socket) {
  console.log('Viz connected');
  socket.emit('allData', [gSongData, gPlayers, gCondData]);

  socket.on('disconnect', function() {
    console.log('Viz disconnected');
  });
});


// find an instrument for this player, based on his chosen section
// return the index to the instrument, or null
var selectInstrument = function(p)
{
  if (p.sectionIdx == null)
    return null;

  // first find all instruments assigned to all player except for player p
  var sec = p.sectionIdx;
  var maxSlots = gSongData.sections[sec].instruments.length;
  var curInsts = Array(maxSlots);
  for (var i = 0; i < maxSlots; i++) { curInsts[i] =0; }

  // fill in curInsts will the number of instruments per slot.
  for (var i=0; i < gPlayers.length; ++i)
  {
    if (gPlayers[i] != p && gPlayers[i].sectionIdx == sec && gPlayers[i].instIdx != null)
      curInsts[gPlayers[i].instIdx] += 1;
  }

  // now, assign the instrument that is "least popular".
  // console.log("curInsts ", curInsts);
  var minVal = 100000;
  var minIdx = 0;
  for(var i=0; i < curInsts.length; ++i)
  {
    if(curInsts[i] < minVal)
    {
      minVal = curInsts[i];
      minIdx = i;
    }
  }
  console.log("inst assigned:", minIdx);
  return minIdx;
}


//------------------------------------
// Connection to Players
//
var gPlayerID = 1;
var gPlayerNS = io.of('/player');
gPlayerNS.on('connection', function(socket) {
  console.log('Player connected');

  // add player to gPlayers list
  var player = { id: gPlayerID, name:"", sectionIdx:null, instIdx:null };
  gPlayerID += 1;
  gPlayers.push(player);
  console.log('players:', gPlayers);

  // tell this new player about everything:
  socket.emit('allData', [player, gSongData, gCondData]);

  // tell conductor about latest gPlayers with new player that joined.
  gCondNS.emit('players', gPlayers)

  // Message handling for players:

  // Disconnect
  socket.on('disconnect', function() {
    console.log('Player disconnected');
    var idx = gPlayers.indexOf(player);
    if (idx != -1)
    {
      gPlayers.splice(idx, 1);
      gCondNS.emit('players', gPlayers)
    }
    else
    {
      console.log("Ooops: player that disconnected not found");
    }
    console.log('players:', gPlayers);
  });

  // player is setting parameters.
  socket.on('set', function(msg) {
    console.log('player set', msg);
    var key = msg[0];
    player[key] = msg[1];

    // assign an instrument (instIdx) to the player. 
    player.instIdx = selectInstrument(player);

    // Send updates to player and conductor
    gCondNS.emit('players', gPlayers)
    socket.emit('playerData', player);

  });

  // real time instrument control
  socket.on('ctrl', function(msg) {
    sendToMax('/ctrl', msg);
  });

  socket.on('maxsetup', function(msg) {
    console.log('maxsetup');
    if (gMaxSender)
      gMaxSender.send('/inst', ["buttons", "audio/beep.wav", "audio/frog.wav", "audio/hit.wav"])
  });

});

startup();

