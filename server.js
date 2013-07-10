var http = require('http'), 
  express = require('express'),
  path = require('path'),
  roomCache = require('./src/roomsCache'),
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

    //get the roomName from the payload.
    var roomName = data.room;

    //get the user object form the payload.
    var user = {
      name : data.message.name || null,
      vote : data.message.vote || null
    };
    //if a user joins:
    if(data.message.eventType === 'join') {
      //we add the user to the room:
      roomCache.addUpdateUser(roomName, user)
      //respond to the user who joined with the curroomName status.
      socket.emit('event', {
        message : {
          eventType : 'roomStatus', 
          room : roomCache.getRoomByName(roomName)
        }
      });
    }
    //if a user votes:
    else if(data.message.eventType === 'vote') {
      roomCache.addUpdateUser(roomName,user);
    }
    //if the visibility of the votes has changed.
    else if(data.message.eventType === 'toggle') {
      roomCache.updateVoteVisibility(roomName, data.message.reveal);
    }
    //if the vote reset was effected.
    else if(data.message.eventType === 'reset') {
      roomCache.resetVotes(roomName);
    }

    //we emit the event to the other clients.
    io.sockets.in(roomName).emit('event', data);
  });
  
  //when user joins the room
  socket.on('joinRoom', function (data) {
    socket.set('room', data.room, function (){});
    socket.join(data.room);
  });
});
