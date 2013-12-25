/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global */

(function () {
    'use strict';

    var http = require('http'),
        express = require('express'),
        path = require('path'),
        roomCache = require('./src/roomsCache'),
        app = express(),
        port = process.env.PORT || 5000;

    var clients = {};

    //configure the express app
    app.configure(function () {
        app.set('views', __dirname + '/views');
        app.engine('html', require('ejs').renderFile);
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.static(path.join(__dirname, 'public')));
        app.use(app.router);
    });

    app.configure('development', function () {
        app.use(express.errorHandler());
    });

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

    //Start the server:
    var server = http.createServer(app).listen(port, function () {
        console.log("express server listening on port " + port);
    });

    //Sockets
    var io = require('socket.io').listen(server);
    io.sockets.on('connection', function (socket) {
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
                //user.socketId = this.id;

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
            } else if (data.message.eventType == 'kick') {
                roomCache.kick(roomName, user);
                clients[user.socketId].emit('event', {
                    message : {
                        eventType : 'kicked'
                    }
                });
            } else if (data.message.eventType == 'nudge') {
                clients[user.socketId].emit('event', {
                    message : {
                        eventType : 'nudged'
                    }
                });
            } else if (data.message.eventType == 'message') {
                clients[user.socketId].emit('event', {
                    message : {
                        eventType : 'messaged',
                        payload : data.message.payload
                    }
                });
            }

            //we emit the event to the other clients.
            io.sockets.in(roomName).emit('event', data);
        });

        //when user joins the room
        socket.on('joinRoom', function (data) {
            socket.set('room', data.room, function () {});
            socket.join(data.room);
        });
    });
})();
