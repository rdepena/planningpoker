var http = require('http'), 
  express = require('express'),
  path = require('path');

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
    io.sockets.in(data.room).emit('event', data)
  });
  socket.on('joinRoom', function (room) {
    socket.set('room', room, function (){
      console.log('room is created ' + room);
    });
    socket.join(room);
  });
});
