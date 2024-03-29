//
// Node.js main app for *12* server
//

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var osc = require('node-osc');
var fs = require('fs');


var gHttpListenPort = 80;
var gOscListenPort = 12346;
var gOscListenHost = '0.0.0.0';

var gOscSender = null;
var gOscListener = null;

var gPlayers = [];
var gPlayerCache = {};

var gSongData = { 
  name: "*12*",
  sections: [
    { name:"Taurus",
      instruments: [
        { name:'scratchy paper', 
          color: 'blue',
          surfaces:[['long pattern', ], ['medium pattern', ], ['short pattern', ], ]},

        { name:'maracas', 
          color: 'yellow',
          surfaces:[['hit', ], ['long shake', ]]},

        { name:'log drum', 
          color: 'red',
          surfaces:[['long pattern', ], ['pattern 1', ], ['pattern 2', ], ]},
        ]},

    { name:"Leo",
      instruments: [
        { name:'temple block', 
          color: 'blue',
          surfaces:[['rising', 'speed'], ['falling', 'speed']]},

        { name:'tambourine',
          color: 'yellow',
          surfaces:[['hit', ], ['shake', ]]},

        { name:'bass drum', 
          color: 'red',
          surfaces:[['rumble', 'pitch']]},
        ]},

    { name: "Scorpio",
      instruments: [
        { name:'crotale',
          color: 'blue',
          surfaces:[['hit', 'pitch'], ['bowed', 'pitch']]},

        { name:'temple blocks', 
          color: 'yellow',
          surfaces:[['', 'pattern']]}, 

        { name:'gong', 
          color: 'red',
          surfaces:[['multi hit', ], ['one hit', ], ['bendy', ], ]},
        ]},

    { name: "Aquarius",
      instruments: [
        { name:'glockenspiel',
          color: 'blue',
          surfaces:[['quick', 'speed'], ['pattern', 'pitch']]},

        { name:'rain sounds', 
          color: 'yellow',
          surfaces:[['rain stick', ], ['drum rumble', ]]},

        { name:'toy hose', 
          color: 'red',
          surfaces:[['', 'spin speed']]},
        ]},

  ]
};

// create public access to files
app.use(express.static('public'));
app.use(express.static('viz'));

// this serves up a page of html for the instrument when a request comes in.
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// this serves up a page of html for the conductor page.
app.get('/cond', function(req, res) {
  res.sendFile(path.join(__dirname, 'cond_index.html'));
});

// this serves up a page for the visual display
app.get('/viz', function(req, res) {
  console.log('requesting visuals');
  res.sendFile(path.join(__dirname, 'viz/viz_index.html'));
});


var startup = function () 
{
  console.log("Node.js version is:", process.version);
  setInterval(onIntervalCB, 1000);
  setInterval(autoPlayPoll, 100);
  loadData();
}


var onIntervalCB = function () 
{
  saveData();
  // console.log("onIntervalCB");
  if (gOscSender)
  {
    // send hearbeat to max so we know connection is alive.
    gOscSender.send('/heart')
  }
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


var AutoPlayer = function(playerID) {
  this.playerID = playerID;
  this.counter = 0;
  this.onCnt = randInt(1, 15);
  this.offCnt = this.onCnt + randInt(5, 15);
}

AutoPlayer.prototype.poll = function() {

  if (this.counter == this.onCnt) {
    sendToMax('/ctrl', [this.playerID, 0, 'play', randFloat(.6, .95), randFloat(.1, .9)]);
  }

  if (this.counter == this.offCnt) {
    this.stop();
    this.counter = 0;
    this.onCnt = randInt(1, 15);
    this.offCnt = this.onCnt + randInt(10, 20);
  }

  this.counter += 1;
}

AutoPlayer.prototype.stop = function() {
  sendToMax('/ctrl', [this.playerID, 0, 'stop', 0, 0]);
}


var gAutoPlayers = null;

var autoPlayPoll = function () {
  if (!gCondData.autoPlay && gAutoPlayers != null) {
    for (var i = 0; i < gAutoPlayers.length; i++) {
      gAutoPlayers[i].stop();
    }

    gAutoPlayers = null;
    console.log('AP stopping');
  }

  if (gCondData.autoPlay) {
    if (gAutoPlayers == null) {
      gAutoPlayers = [new AutoPlayer(0), new AutoPlayer(1), new AutoPlayer(2)];
      console.log('AP starting');
    }

    // console.log('AP poll');
    for (var i = 0; i < gAutoPlayers.length; i++) {
      gAutoPlayers[i].poll();
    }
  }
}

var saveData = function() {
  var data = [gPlayerCache, gCondData];
  fs.writeFile('server_data.txt', JSON.stringify(data, null, 2), function(err) { } );
}

var loadData = function() {
  try {
    var f = fs.readFileSync('server_data.txt');
    var data = JSON.parse(f);
    console.log(data);
    gPlayerCache = data[0];
    gCondData = data[1];
    console.log('loaded data');
  }
  catch (e) {
    console.log('data file not found')
  }
}
// what port to listen on for this http server:
var server = http.listen(gHttpListenPort, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Http: listening at', host, port);


  // listen to OSC messages (which come from Max/Msp)
  gOscListener = new osc.Server(gOscListenPort, gOscListenHost);
  console.log('OSC: listening at', gOscListenHost, gOscListenPort);

  // receive messages from max, tagged as /max
  gOscListener.on('message', function(msg, rinfo) {
    // console.log('osc received:', msg, rinfo);
    if (msg[0] == '/max')
      onMaxMsg(msg);
  });
});


//------------------------------------
// Connection to Max
//

var onMaxMsg = function(msg)
{
  if (msg[1] == 'hello') {
    var ip = msg[2]
    var port = msg[3]
    console.log("creating gOscSender to", ip, port);
    if (gOscSender) {
      gOscSender.kill();
    }
    gOscSender = new osc.Client(ip, port);
    sendMaxCondData();
  }

  else if (msg[1] == 'bye') {
    if (gOscSender)
    {
      console.log("removing gOscSender");
      gOscSender.kill();
      gOscSender = null;
    }
  }

  else if (msg[1] == 'note') {
    // console.log("note from Max");
    gVizNS.emit('note', msg.slice(2));
  }
}


var sendMaxCondData = function() {
  if (gOscSender) 
  {
    idx = gCondData.sectionIdx == null ? 'null' : gCondData.sectionIdx;
    gOscSender.send('/sectionIdx', [idx]);
  }
}

var sendToMax = function(tag, msg) {
  // console.log('toMax', tag, msg);
  if (gOscSender) {
    gOscSender.send(tag, msg);
  }
}


//------------------------------------
// Connection to Conductor
//
var gCondData =
{
  'sectionIdx': null,
  'autoPlay': false
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
  socket.emit('condData', gCondData);

  socket.on('disconnect', function() {
    console.log('Viz disconnected');
  });
});



//------------------------------------
// Connection to Players
//
var gPlayerID = 1;
var gPlayerNS = io.of('/player');
gPlayerNS.on('connection', function(socket) {
  console.log('Player connected');

  var player = null;

  socket.emit('start');


  //------------------------------------------
  //      Message handling for players

  // hello / initial connect
  socket.on('hello', function(devID) {
    console.log('hello:', devID);
    // add player to gPlayers list

    // if cached data does not exist, create it
    if (devID in gPlayerCache == false) {
      console.log('not found');
      gPlayerCache[devID] = { id: 0, name:"", sectionIdx:null, instIdx:null, page:1 };
    }
    else
    {
      console.log('found it!!');
    }

    console.log('cache', gPlayerCache);

    // load saved data for this player. Give it a unique ID.
    player = gPlayerCache[devID];
    player.id = gPlayerID;
    gPlayerID += 1;

    gPlayers.push(player);
    console.log('players:', gPlayers);

    // tell this new player about everything:
    socket.emit('allData', [player, gSongData, gCondData]);

    // tell conductor about latest gPlayers with new player that joined.
    gCondNS.emit('players', gPlayers);
  });

  // Disconnect
  socket.on('disconnect', function() {
    console.log('Player disconnected');
    var idx = gPlayers.indexOf(player);
    if (idx != -1)
    {
      gPlayers.splice(idx, 1);
      gCondNS.emit('players', gPlayers);
    }
    else
    {
      console.log("Ooops: player that disconnected not found");
    }
    console.log('players:', gPlayers);
    player = null;
  });

  // player is setting parameters.
  socket.on('set', function(msg) {
    console.log('player set', msg);
    if (player) {
      var key = msg[0];
      player[key] = msg[1];

      // if player is choosing a section, reset the instrument:
      if (key == 'sectionIdx')
        player.instIdx = null;

      // Send updates to player and conductor
      gCondNS.emit('players', gPlayers)
      socket.emit('playerData', player);
    }
  });

  // real time instrument control
  socket.on('ctrl', function(msg) {
    sendToMax('/ctrl', msg);
  });

});

startup();

