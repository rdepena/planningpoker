/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global planningShark, angular*/

(function (planningShark) {
	"use strict";

	//we create our planning poker app
	planningShark.app = angular.module('planningShark', ['planningShark.services']);

	//configure our planning module.:
	planningShark.app.config(function ($routeProvider) {
		$routeProvider
			.when('/', { controller : planningShark.poker.createCtrl, templateUrl : 'templates/createjoin.html' })
			.when('/room/:roomName/:userName', {controller : planningShark.poker.roomCtrl, templateUrl: 'templates/room.html'})
			.when('/room/:roomName/:userName/:master', {controller : planningShark.poker.roomCtrl, templateUrl: 'templates/room.html'})
			.when('/join/:roomName', { controller : planningShark.poker.joinCtrl, templateUrl : 'templates/createjoin.html'})
			.otherwise({redirectTo: '/'});
	});

	//set up constants:
	//application events.
	planningShark.app.constant('events',
		{
			VOTE_RESET : 'reset',
			VOTE : 'vote',
			USER_JOIN : 'join',
			VOTE_VISIBILITY_TOGGLE : 'toggle',
			ROOM_STATUS : 'roomStatus',
			USER_KICK : 'kick',
            USER_KICKED : 'kicked',
            USER_MESSAGE : 'message',
            USER_MESSAGED : 'messaged',
            USER_NUDGE : 'nudge',
            USER_NUDGED : 'nudged',
            SUBJECT: 'subject',
            MESSAGEALL: 'messageall'
		});
	//card deck.
	planningShark.app.constant('deck', ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', 'caffeine']);

})(this.planningShark = this.planningShark || {});;/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global */

(function (planningShark) {
	"use strict";

	//poker contains all the functionality related specifically with planning poker.
	planningShark.poker =  {};

	//createCtrl is in charge of creating the room.
	planningShark.poker.createCtrl = function ($scope, $location, cookies) {
		$scope.openSessions = cookies.get();
		//we create a random string to be used as a room ID.
		$scope.join = function () {
			var roomName = Math.random().toString(36).substring(7),
				path = '/room/' + roomName + '/' + $scope.userName + '/true';
			$location.path(path);
		};

		//deletes the session cookie.
		$scope.delete = function (cookie) {
			cookies.remove(cookie.name);
			$scope.openSessions = cookies.get();
		};
	};

	//joinCtrl is in charge of how users join existing rooms.
	planningShark.poker.joinCtrl = function ($scope, $location, $routeParams) {

		//this property represents the existing room Id that we will join.
		$scope.roomName = $routeParams.roomName;
		//we join a room that has been passed via the route params.
		$scope.join = function () {
			var path = '/room/' + $scope.roomName + '/' + $scope.userName;
			$location.path(path);
		};
	};

	//roomCtrl is responsible for all and actions you can take while in a room.
	planningShark.poker.roomCtrl = function ($scope, $http, $location, $routeParams, deck, room) {
		//set values for the view:
		$scope.currentUser = { name : $routeParams.userName };
		$scope.roomName = $routeParams.roomName;
		$scope.isMaster = $routeParams.master === 'true';
		$scope.deck = deck;
		var path = '/room/' + $scope.roomName + '/' + $scope.currentUser.name;

		//join the room:
		room.setupRoom($scope.roomName);
		$scope.users = room.users;
		room.join($scope.roomName, path, $scope.currentUser);

		//expose room logic: 

		$scope.voteRevealed =  function () {
			return room.voteRevealed;
		};
		$scope.voteCounts = function () {
			return room.voteCount;
		};
		//scope functions:

		//handles the voting logic
		$scope.vote = function (card) {
			$scope.currentUser.vote = card;
			room.vote(card, $scope.currentUser);
		};
		//accepts true or false and changes the state of vote visibility accordingly 
		$scope.updateVoteVisibility = function (val) {
			room.updateVoteVisibility(val, true);
		};
		//handles the reset vote logic.
		$scope.resetVotes = function () {
			//we send a value to send the notification.
			room.resetVotes(true);
		};

        $scope.subjectIsSet = function() {
            return room.subjectIsSet;
        };

        //additional commands
        $scope.command = function(command, user, from) {
            var payload;

            if (command == "kick") {
                room.kick(user);
            } else if (command == "message") {
                room.message(user, from, getMessage());
            } else if (command == "messageall") {
                room.messageall(from, getMessage());
            } else if (command == "nudge") {
                room.nudge(user);
            } else if (command == "subject") {
                room.subject(getSubjectDetails());
            } else if (command == "remind") {
                room.remind();
            }
        };

        function getMessage() {
            return prompt("What is your message?", "");
        }

        function getSubjectDetails() {
            return prompt("What is the subject of this session?", "");
        }
	};

})(this.planningShark = this.planningShark || {});;/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global jasmine, describe, beforeEach, it, inject, planningShark, expect, rtms, angular, spyOn*/

(function (planningShark) {
	'use strict';

	planningShark.services = planningShark.services || angular.module("planningShark.services", []);

	planningShark.services.factory('cookies', function () {
		var my = {};
		$.cookie.json = true;

		my.add = function (name, value, options) {
			$.cookie(name, value, options);
		};

		my.get = function (name) {
			var cookiesArray = [],
				currentCookies = $.cookie(name);
			for (var c in currentCookies) {
				if (currentCookies.hasOwnProperty(c)) {
					//make sure the cookie has a path value.
					if (currentCookies[c] && currentCookies[c].path) {
						cookiesArray.push(currentCookies[c]);	
					}
				}
			}
			return cookiesArray;
		};

		my.remove = function (name) {
			$.removeCookie(name);
		};

		return my;
	});

	return planningShark.services;
})(this.planningShark = this.planningShark || {});;/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global jasmine, describe, beforeEach, it, inject, planningShark, expect, rtms, angular, spyOn*/

(function (planningShark) {
	'use strict';

	planningShark.services = planningShark.services || angular.module("planningShark.services", []);

	planningShark.services.factory('room', function (socket, events, cookies) {

		var my = {};
		my.users = [];
		my.voteRevealed = false;
        my.subjectIsSet = false;
		my.voteCount = null;
		my.roomName = null;

		//private functions to react to socket events.
		//we receive the message that a user voted
		var onVote = function (message) {
			my.addUpdateUser(
				{
					name : message.name,
                    socketId: message.socketId,
					vote : message.vote
				}
			);
			my.calcVoteCount();
		};
		//we receive the message that a user joined.
		var onUserJoin = function (message) {
			my.addUpdateUser({
				name : message.name,
                socketId: message.socketId,
				vote : message.vote
			});
		};
		//we receive the a message to change the visibility
		var onUpdatedVisibility =  function (message) {
			my.voteRevealed = message.reveal;
		};
		//we receive the message that the votes have been reset
		var onVoteReset = function (message) {
			my.resetVotes();
		};
		//we receive the room status.
		var onRoomStatus = function (message) {
			angular.forEach(message.room.users, function (p) {
				my.addUpdateUser({
					name : p.name,
					vote : p.vote,
                    socketId : p.socketId
				});
			});
			my.voteRevealed = message.room.displayVotes;
		};
		// person kicked off
		var onKick = function (user) {
            var location = 0;
            angular.forEach(my.users, function (u) {
                if (u.name === user.name) {
                    my.users.splice(location, 1);
                    return;
                }
                location++;
            });
		};

        var onKicked = function () {
            location.href = '/end';
        };

        var onMessaged = function (message) {
            if (message.payload !== null) {
                $.growl.notice({ title : (message.type === 'private' ? "Private " : "Room ") + "Message", message: message.from + ": " + message.payload });
            }
        };

        var onNudged = function() {
            $("body").effect("shake");
        };

        var onSubject = function(message) {
            if (message.payload !== null) {
                my.subjectIsSet = true;
                if (message.payload.indexOf("http") === 0) {
                    var width = 800;
                    var height = 600;
                    var w_offset = 40;
                    var h_offset = 60;

                    $("#dialog").html($("<iframe width='" + (width - w_offset) + "' height='" + (height - h_offset) + "' />").attr("src", message.payload)).dialog({ width: width, height: height, modal: true });
                } else {
                    $("#dialog").html(message.payload).dialog({ width: 300, height: 140, modal: true });
                }
            }
        };

        var onRemind = function() {
            $("#dialog").dialog();
        };

		//we either update or add a new user.
		my.addUpdateUser = function (user) {
			var exists = false;
			angular.forEach(my.users, function (u) {
				if (u.name === user.name) {
					u.vote = user.vote;
                    u.socketId = user.socketId;
					exists = true;
				}
			});
			if(!exists) {
				my.users.push(user);
			}
		};

		my.join = function (roomName, path, user) {
			//TODO: get this from somewhere else.
			my.roomName = roomName;
			//save a cookie so we can display recent sessions
			cookies.add(roomName, { name : roomName, path: path, joinDate : Date.now()}, {expires : 1});
			my.addUpdateUser(user);
			socket.publish({ eventType : events.USER_JOIN, name : user.name });
		};

		my.vote = function (card, user) {
			user.vote = card;
			//we send the vote over the wire
			//TODO: send user not card/name combo.
			socket.publish({eventType : events.VOTE, vote : card, name : user.name, socketId : user.socketId });
		};

		my.updateVoteVisibility = function (voteVisible, sendNotification) {
			//return parameter for chaining.
			my.voteRevealed = voteVisible;

			//if we are not suposed to send a notification dont.
			if (!sendNotification) {
				return;
			}

			//send update over the wire.
			socket.publish(
				{
					eventType : events.VOTE_VISIBILITY_TOGGLE,
					reveal : voteVisible
				}
			);
		};

		my.resetVotes = function (sendNotification) {
			angular.forEach(my.users, function (p) {
				p.vote = null;
			});
			my.voteCount = null;
            my.subjectIsSet = null;
			my.updateVoteVisibility(false, false);
			if (sendNotification) {
				socket.publish({eventType : events.VOTE_RESET});
			}
		};

        my.kick = function(user) {
            socket.publish({eventType : events.USER_KICK, name : user.name, socketId : user.socketId });
        };

        my.message = function(user, from, payload) {
            socket.publish({eventType : events.USER_MESSAGE, from : from, payload : payload, socketId : user.socketId });
        };

        my.nudge = function(user) {
            socket.publish({eventType : events.USER_NUDGE, socketId : user.socketId });
        };

        my.subject = function(payload) {
            socket.publish({eventType : events.SUBJECT, payload: payload });
        };

        my.messageall = function(from, payload) {
            socket.publish({eventType : events.MESSAGEALL, from : from, payload: payload });
        };

        my.remind = function() {
            onRemind();
        };

		my.setupRoom = function (roomName) {
			
			my.roomName = roomName;
			my.users = [];
			my.voteRevealed = false;
            my.subjectIsSet = false;
			my.voteCount = null;

			//sets up the socket subscription.
			var options = {
				roomName : my.roomName,
				message : function (message) {
					switch (message.eventType) {
					case events.VOTE:
						onVote(message);
						break;
					case events.USER_JOIN:
						onUserJoin(message);
						break;
					case events.VOTE_VISIBILITY_TOGGLE:
						onUpdatedVisibility(message);
						break;
					case events.VOTE_RESET:
						onVoteReset(message);
						break;
					case events.ROOM_STATUS:
						onRoomStatus(message);
						break;
                    case events.USER_KICK:
						onKick(message);
						break;
                    case events.USER_KICKED:
                        onKicked();
                        break;
                    case events.USER_MESSAGED:
                        onMessaged(message);
                        break;
                    case events.USER_NUDGED:
                        onNudged();
                        break;
                    case events.SUBJECT:
                        onSubject(message);
                        break;
                    }
				}
			};
			//we use socket to abstract any subscription policy.
			socket.subscribe(options);
		};

		//calculate vote counts.
		my.calcVoteCount = function () {
			var vc = [];
			angular.forEach(my.users, function (u) {
				//we check to see if this vote is alredy 
				var vote = null;
				angular.forEach(vc, function (v) {
					if (v.vote === u.vote) {
						vote = v;
					}
				});

				//if a user already voted using this value add 1 to it.
				if (vote !== null) {
					vote.count += 1;
				} else {
					vc.push({
						vote : u.vote,
						count : 1
					});
				}
			});
			my.voteCount = vc;
		};

		return my;

	});

	return planningShark.services;

})(this.planningShark = this.planningShark || {});;/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global */

(function (planningShark) {
	'use strict';
	planningShark.services = planningShark.services || angular.module("planningShark.services", []);

	planningShark.services.factory('socket', function ($rootScope) {
		var my = {};

		//we will use rooms to isolate messages.
		var room = '';

		//init the connection
		var rtms = io.connect(window.location.hostname);
		my.subscribe = function (options) {
			room = options.roomName;
			rtms.on('event', function(data) {
				if (angular.isFunction(options.message)) {
					$rootScope.$apply(function () {
						options.message(data.message);
					});
				}
			});
			
			rtms.emit('joinRoom', { room : room });
		};

		my.publish = function (msg) {
			rtms.emit('broadcast', 
			{
				room : room,
				message : msg
			});
		};

		return my;
	});

	return planningShark.services;

})(this.planningShark = this.planningShark || {});