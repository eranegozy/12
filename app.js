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
var gListenPort = 12346;
var gOscServer;

var gPlayers = [];

var gSongData = { 
  name: "*12*",
  sections: [
    {name:"1: Pices",
     instruments: [{name:'plook', type:'buttons', size:4},
                   {name:'yikes', type:'1d', size:2}]},
    {name:"2: Sagitarius",
     instruments: [{name:'fish', type:'buttons', size:3},
                   {name:'cow',  type:'buttons', size:4},
                   {name:'bird', type:'buttons', size:5}]},
    {name:"3:Scorpio",
     instruments: [{name:'broom', type:'1d', size:1},
                   {name:'slurp', type:'1d', size:3},
                   {name:'saw',   type:'2d'},
                   {name:'soap',  type:'2d'}]},
  ]
};

// create public access to files
app.use(express.static('public'));
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
  gOscServer = new osc.Server(gListenPort, '0.0.0.0');
  console.log('OSC: listening at', gListenPort);

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
  }

  if (msg[1] == 'bye') {
    if (gMaxSender)
    {
      console.log("removing gMaxSender");
      gMaxSender.kill();
      gMaxSender = undefined;
    }
  }
}



//------------------------------------
// Connection to Conductor
//
var gCondData =
{
  'enabled': false,
  'sectionIdx': -1,
}

var gCondNS = io.of('/cond');
gCondNS.on('connection', function(socket) {
  console.log('Conductor connected');
  // socket.emit('allData', [gSongData, gPlayers, gCondData]);
  socket.emit('songData', gSongData);
  socket.emit('players', gPlayers);
  socket.emit('condData', gCondData);

  socket.on('disconnect', function() {
    console.log('Conductor disconnected');
  });

  socket.on('set', function(msg) {
    console.log(msg);
    var key = msg[0];
    gCondData[key] = msg[1];
    gCondNS.emit('condData', gCondData)
  });
});


// assign an instrument to this player, based on his chosen section
var assignInstrument = function(p)
{
  // first find all instruments assigned to all player except for player p
  var sec = p.sectionIdx;
  var maxSlots = gSongData.sections[sec].instruments.length;
  var curInsts = Array(maxSlots);
  for (var i = 0; i < maxSlots; i++) { curInsts[i] =0; }

  // fill in curInsts will the number of instruments per slot.
  for (var i=0; i < gPlayers.length; ++i)
  {
    if (gPlayers[i] != p && gPlayers[i].sectionIdx == sec && gPlayers[i].instIdx >= 0)
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
  p.instIdx = minIdx;
  console.log("inst assigned:", p.instIdx);
}

//------------------------------------
// Connection to Players
//
var gPlayerID = 1;
var gPlayerNS = io.of('/player');
gPlayerNS.on('connection', function(socket) {
  console.log('Player connected');

  var player = { id: gPlayerID, name:"", sectionIdx:undefined, instIdx:undefined };
  gPlayerID += 1;
  gPlayers.push(player);
  console.log('players:', gPlayers);

  socket.emit('songData', gSongData);
  gCondNS.emit('players', gPlayers)

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

  // player is updating his playerData.
  socket.on('playerData', function(data) {
    console.log('received playerData:', data);
    player.name = data.name;
    player.sectionIdx = data.sectionIdx;
    console.log(gPlayers);

    // assign an instrument and send out info to that player.
    assignInstrument(player);
    var data = { instIdx: player.instIdx };
    socket.emit('statusData', data);
    gCondNS.emit('players', gPlayers)

  });

  socket.on('control', function(msg) {
    console.log('control:' + msg);
    if (gMaxSender)
      gMaxSender.send('/ctrl', msg)
  });

  socket.on('maxsetup', function(msg) {
    console.log('maxsetup');
    if (gMaxSender)
      gMaxSender.send('/inst', ["buttons", "audio/beep.wav", "audio/frog.wav", "audio/hit.wav"])
  });

});

startup();

