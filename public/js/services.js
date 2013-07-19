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

	planningShark.services.factory('room', function (participants, socket, events){
		var my = {};

		my.participants = [];

		my.join = function (roomName, path, user) {
			//save a cookie so we can display recent sessions
			cookies.add(roomName, { path: path, joinDate : Date.now()}, {expires : 1});
			participants.add(user);
		};

		my.vote = function (card, user) {
			user.vote = card;
			//we send the vote over the wire
			//TODO: send user not card/name combo.
			socket.publish({eventType : events.VOTE, vote : card, name : $scope.currentUser.name});
		};

		my.updateVoteVisibility = function (voteVisible) {

			//send update over the wire.
			socket.publish(
			{
				eventType : events.VOTE_VISIBILITY_TOGGLE, 
				reveal : voteVisible
			});

			//return parameter for chaining.
			return voteVisible;
		};

		my.resetVotes = function (sendNotification){
			participants.resetVotes();
			if(sendNotification) {
				socket.publish({eventType : events.VOTE_RESET});
			}

		}

		return my;

	});

	planningShark.services.factory('participants', function (){
		var my = {}

		my.participantList = [];

		my.voteCount = function () {
			var vc = [];
			angular.forEach(my.participantList, function(u) {
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

		//helper functions:
		my.participantExists = function (name, onExists) {
			var retparticipant;
			angular.forEach(my.participantList, function(p){
				if(p.name === name) {
					retparticipant = p;
					if(angular.isFunction(onExists)) {
						onExists(p);	
					}
				}
			});
			return retparticipant; 
		}

		my.add = function (participant) {
			var existingParticipant = my.participantExists(participant.name);
			if(!existingParticipant) {
				my.participantList.push(participant);
			}
			else my.updateVote(existingParticipant);
		};

		my.updateVote = function (participant) {
			var existingParticipant = my.participantExists(participant.name);
			if(existingParticipant) {
				existingParticipant.vote = participant.vote;
			}
			else {
				my.participantList.push(participant);
			}
		};

		my.resetVotes = function () {
			angular.forEach(my.participantList, function (p){
				p.vote = null;
			});
		}

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
	
	planningShark.services.factory('socket', function(){
		var my = {};

		//we will use rooms to isolate messages.
		var room = '';

		//init the connection.
		var socket = io.connect(window.location.hostname);

		my.subscribe = function (options) {
			room = options.channel;
			socket.on('event', function(data) {
				if(angular.isFunction(options.message)) {
					options.message(data.message);
				}
			});
			socket.emit('joinRoom', { room : room , name : name });
			socket.on('connect', function (){
				if(angular.isFunction(options.connect)) {
					options.connect();
				}
			});
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