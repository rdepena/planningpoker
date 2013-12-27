/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
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

})(this.planningShark = this.planningShark || {});