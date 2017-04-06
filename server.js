/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var path = require('path'),
    roomCache = require('./src/roomsCache'),
    port = process.env.PORT || 5000;

var clients = {};

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));

//Routes:
app.get('/', function (req, res) {
    res.render('index.html');
});

app.get('/end', function (req, res) {
    res.render('end.html');
});

app.get('*', function (req, res) {
    res.render('404.html');
});

io.on('error', (err) =>console.log(err));
io.on('connection', function (socket) {
    clients[socket.id] = socket;
    socket.on('broadcast', function (data) {

        //get the roomName from the payload.
        var roomName = data.room,
            user = {
                name : data.message.name || null,
                vote : data.message.vote || null,
                socketId : data.message.socketId || this.id
            };

        //if a user joins:
        if (data.message.eventType === 'join') {
            //we add the user to the room:
            data.message.socketId = this.id;

            roomCache.addUpdateUser(roomName, user);
            //respond to the user who joined with the curroomName status.
            socket.emit('event', {
                message : {
                    eventType : 'roomStatus',
                    room : roomCache.getRoomByName(roomName)
                }
            });
        } else if (data.message.eventType === 'vote') {
            //if a user votes:
            roomCache.addUpdateUser(roomName, user);
        } else if (data.message.eventType === 'toggle') {
            //if the visibility of the votes has changed.
            roomCache.updateVoteVisibility(roomName, data.message.reveal);
        } else if (data.message.eventType === 'reset') {
            //if the vote reset was effected.
            roomCache.resetVotes(roomName);
        }

        //we emit the event to the other clients.
        io.sockets.in(roomName).emit('event', data);
    });

    //when user joins the room
    socket.on('joinRoom', function (data) {
        socket.room = data.room;
        socket.join(data.room);
    });
});

http.listen(port, () => {
	console.log('listening on port', port);
});
