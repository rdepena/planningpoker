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
