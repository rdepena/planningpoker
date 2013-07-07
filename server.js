var http = require('http'), 
  express = require('express'),
  path = require('path'),
  roomCache = require('./poker/rooms'),
  emitter = require("events").EventEmitter,
  _events = new emitter();

//create the express app
var app = express();

//configure the express app
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
   app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
  
//Routes:
app.get('/', function (req, res){
  res.render('index.html'); 
});

app.get('*', function(req, res){
  res.render('404.html');
});

//TODO: Get these functions out of here:
//Server side events: 
//Cache logic:
var onUserUpdate = function (roomName, user) {
  roomCache.addUpdateUser(roomName, user);
}

var onUserJoin = function (roomName, user) {
  onUserUpdate(roomName, user);
  return roomCache.roomByName(roomName);
}

var updateVoteVisibility = function (roomName, visible) {
  roomCache.roomByName(roomName).displayVotes = visible;
}

//Start the server:
var port = process.env.PORT || 5000;
var server = http.createServer(app).listen(port, function(){
  console.log("express server listening on port " + port);
});

//Sockets
var io = require('socket.io').listen(server);
//Heroku does not support web sockets, so we fallback to polling:
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});
io.sockets.on('connection', function (socket) {
  socket.on('broadcast', function (data) {
    if(data.message.eventType === 'join') {

      socket.emit('event', {
        message : {
          eventType : 'roomStatus', 
          room : onUserJoin(data.room, { 
            name : data.message.name, 
            vote : data.message.vote
          })
        }
      });
    }
    else if(data.message.eventType === 'vote') {
      onUserUpdate(data.room, { 
        name : data.message.name, 
        vote : data.message.vote
      });
    }
    else if(data.message.eventType === 'toggle') {
      updateVoteVisibility(data.room, data.message.reveal);
    }
    io.sockets.in(data.room).emit('event', data);
    //rooms[data.room].participants.push()
    console.log(rooms);
  });
  
  //when user joins the room
  socket.on('joinRoom', function (data) {
    socket.set('room', data.room, function (){});
    socket.join(data.room);
  });
});
