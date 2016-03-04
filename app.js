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

var gMaxSender;
var gOscListenPort = 12346;
var gOscServer;

var gPlayers = [];
var gPlayerCache = {};

var gSongData = { 
  name: "*12*",
  sections: [
    { name:"Taurus",
      instruments: [
        { name:'scratchy paper', 
          color: 'red',
          surfaces:[['long pattern', ], ['medium pattern', ], ['short pattern', ], ]},

        { name:'maracas', 
          color: 'green',
          surfaces:[['hit', ], ['long shake', ]]},

        { name:'log drum', 
          color: 'blue',
          surfaces:[['long pattern', ], ['pattern 1', ], ['pattern 2', ], ]},
        ]},

    { name:"Leo",
      instruments: [
        { name:'temple block', 
          color: 'red',
          surfaces:[['rising', 'speed'], ['falling', 'speed']]},

        { name:'tambourine',
          color: 'green',
          surfaces:[['hit', ], ['shake', ]]},

        { name:'bass drum', 
          color: 'blue',
          surfaces:[['rumble', 'pitch']]},
        ]},

    { name: "Scorpio",
      instruments: [
        { name:'crotale',
          color: 'red',
          surfaces:[['hit', 'pitch'], ['bowed', 'pitch']]},

        { name:'temple blocks', 
          color: 'green',
          surfaces:[['', 'pattern']]}, 

        { name:'gong', 
          color: 'blue',
          surfaces:[['multi hit', ], ['one hit', ], ['bendy', ], ]},
        ]},

    { name: "Aquarius",
      instruments: [
        { name:'glockenspiel',
          color: 'red',
          surfaces:[['quick', 'speed'], ['pattern', 'pitch']]},

        { name:'rain sounds', 
          color: 'green',
          surfaces:[['rain stick', ], ['drum rumble', ]]},

        { name:'toy hose', 
          color: 'blue',
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


// this serves up a page of html for the conductor page.
app.get('/m', function(req, res) {
  console.log('requesting mobile');
  res.sendFile(path.join(__dirname, 'mobile_index.html'));
});



var startup = function () 
{
  console.log("Node.js version is:", process.version);
  setInterval(onIntervalCB, 1000);
  loadData();
}


var onIntervalCB = function () 
{
  saveData();
  // console.log("onIntervalCB");
  if (gMaxSender)
  {
    // send hearbeat to max so we know connection is alive.
    gMaxSender.send('/heart')
  }
}


var saveData = function() {
  var data = [gPlayerCache, gCondData];
  fs.writeFile('server_data.txt', JSON.stringify(data, null, 2));
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
var server = http.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Http: listening at', host, port);

  // listen to OSC messages (which come from Max/Msp)
  gOscServer = new osc.Server(gOscListenPort, '0.0.0.0');
  console.log('OSC: listening at', gOscListenPort);

  // receive messages from max, tagged as /max
  gOscServer.on('message', function(msg, rinfo) {
    // console.log('osc:', msg, rinfo);
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
    // console.log("note from Max");
    gVizNS.emit('note', msg.slice(2));
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
  // console.log('toMax', tag, msg);
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

