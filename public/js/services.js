(function (planningShark) {

'use strict';
 
	planningShark.services = angular.module("planningShark.services", []);
	
	//register other services here...
	
	/* pubsub - based on https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js*/
	planningShark.services.factory('pubsub', function ($rootScope) {
		//we will return this object.
		var my = {};

		//I keep a copy of the events and their unsubscribe functions that are returned by the $on call.
		var events = {};

        //callback format is function (data). we can modify it later to accept function (event, data) if needed
		my.subscribe = function (event, callback) {
		    var unsubcribeFunction = $rootScope.$on(event, function (onEvent, data) { callback(data); });

		    if (!events[event]) {
		        events[event] = [];
			}

		    var eventObject =
		    {
		        callback: callback,
		        unsubscribeFunction: unsubcribeFunction
		    };

		    events[event].push(eventObject);
		};
		
		my.publish = function (event, data) {
		    $rootScope.$broadcast(event, data);
		};
		
		my.unsubscribe = function (event, callback) {
		    var eventsArray = events[event];
			angular.forEach(eventsArray, function (value, key) {
				if(value.callback == callback) {
				    value.unsubscribeFunction();
				    eventsArray.splice(key, 1);
				}
			});
		};

		return my;
	});

	planningShark.services.factory('room', function (socket, events, cookies, pubsub){
		var my = {};

		my.participants = [];
		my.voteRevealed = false;
		my.voteCount = null;
		my.roomName = null;

		//private functions:
		var participantExists = function (name, onExists) {
			var retparticipant;
			angular.forEach(my.participants, function(p){
				if(p.name === name) {
					retparticipant = p;
					if(angular.isFunction(onExists)) {
						onExists(p);	
					}
				}
			});
			return retparticipant; 
		}
		my.addUpdateParticipant = function (participant) {
			var existingParticipant = participantExists(participant.name);
			if(!existingParticipant) {
				my.participants.push(participant);
			}
			else existingParticipant.vote = participant.vote;;
		};

		my.join = function (roomName, path, user) {
			//save a cookie so we can display recent sessions

			//TODO: get this from somewhere else.
			my.roomName = roomName;

			cookies.add(roomName, { name : roomName, path: path, joinDate : Date.now()}, {expires : 1});
			my.addUpdateParticipant(user);
			socket.publish({ eventType : events.USER_JOIN, name : user.name })
		};

		my.vote = function (card, user) {
			user.vote = card;
			//we send the vote over the wire
			//TODO: send user not card/name combo.
			socket.publish({eventType : events.VOTE, vote : card, name : user.name});
		};

		my.updateVoteVisibility = function (voteVisible) {

			//send update over the wire.
			socket.publish(
			{
				eventType : events.VOTE_VISIBILITY_TOGGLE, 
				reveal : voteVisible
			});

			//return parameter for chaining.
			my.voteRevealed = voteVisible;
		};

		my.resetVotes = function (sendNotification){
			angular.forEach(my.participants, function (p){
				p.vote = null;
			});
			my.voteCount = null;
			if(sendNotification) {
				socket.publish({eventType : events.VOTE_RESET});
			}

		}

		var calcVoteCount = function () {
			var vc = [];
			angular.forEach(my.participants, function(u) {
				//we check to see if this vote is alredy 
				var vote = null;
				angular.forEach(vc, function (v) {
					if (v.vote == u.vote) {
						vote = v;
					}
				});

				//if a user already voted using this value add 1 to it.
				if (vote != null) {
					vote.count++;
				}
				//if its the first or only user voting for this number add it to the vote summary.
				else {
					vc.push({
						vote : u.vote,
						count : 1
					});
				}
			});
			return vc;
		};

		//subscribe to messages: 
		pubsub.subscribe(events.VOTE, function (message) {
				my.addUpdateParticipant(
					{
						name : message.name,
						vote : message.vote 
					});
				my.voteCount = calcVoteCount();
		});

		pubsub.subscribe(events.USER_JOIN, function (message) {
				my.addUpdateParticipant({
					name : message.name,
					vote : message.vote
				});
		});

		pubsub.subscribe(events.VOTE_VISIBILITY_TOGGLE, function (message) {
				my.voteRevealed = message.reveal;
			
		});

		pubsub.subscribe(events.VOTE_RESET, function (message) {
				my.resetVotes();
				my.voteRevealed = false;
		});

		pubsub.subscribe(events.ROOM_STATUS, function (message){
			angular.forEach(message.room.participants, function (p) {
				my.addUpdateParticipant ({
					name : p.name,
					vote : p.vote
				});
			});
			my.voteRevealed = message.room.displayVotes;
		});

		my.setupRoom = function (roomName) {
			
			my.roomName = roomName;
			my.participants = [];
			my.voteRevealed = false;
			my.voteCount = null;

			//sets up the socket subscription.
			var options = {
				roomName : my.roomName,
				message : function (message) {
						pubsub.publish(message.eventType, message);
				}
			}
			//we use socket to abstract any subscription policy.
			socket.subscribe(options);
		};

		return my;

	});

	planningShark.services.factory('cookies', function(){
		var my = {};
		$.cookie.json = true;

		my.add = function (name, value, options) {
			$.cookie(name, value, options);
		};

		my.get = function (name) {
			var cookiesArray = [],
				currentCookies = $.cookie(name);
			for (var c in currentCookies) {
				if(currentCookies.hasOwnProperty(c)) {
					//make sure the cookie has a path value.
					if(currentCookies[c] && currentCookies[c].path) {
						cookiesArray.push(currentCookies[c]);	
					}
				}
			}
			return cookiesArray;
		};

		my.remove = function (name) {
			$.removeCookie(name);
		}

		return my;
	});
	
	planningShark.services.factory('socket', function($rootScope){
		var my = {};

		//we will use rooms to isolate messages.
		var room = '';

		//init the connection.
		var socket = io.connect(window.location.hostname);	
		my.subscribe = function (options) {
			room = options.roomName;
			socket.on('event', function(data) {
				if(angular.isFunction(options.message)) {
					$rootScope.$apply(function () {
					options.message(data.message);
					});
				}
			});
			
			socket.emit('joinRoom', { room : room });
		};

		my.publish = function (msg) {
			socket.emit('broadcast', 
			{
				room : room,
				message : msg
			});
		};

		return my;
	});


	return planningShark.services;

})(this.planningShark = this.planningShark || {});