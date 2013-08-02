/*jslint indent: 4, maxerr: 50, vars: true, nomen: true, white: true*/
/*global jasmine, describe, beforeEach, it, inject, expect, angular*/

'use strict';
// Jasmine spec for roomCache

//set up fakes for SocketIO
var io = jasmine.createSpyObj('io', ['connect']);
io.connect.andCallFake(function () {
    return {
		on : function () {return null;},
		emit : function () {return null;}
    };
});

//set up fakes for Jquery Cookie plugin.
var $ = jasmine.createSpyObj('$', ["cookie", 'removeCookie']);
$.cookie.andCallFake(function () {
	return null;
});
$.removeCookie.andCallFake(function () {
	return null;
});

//we test the room.
describe('roomSpec', function() {
	beforeEach(module("planningShark.services", "planningShark"));
	describe("room service CRUD Test", function() {

		//adding a user.
		it("should add a user", inject(function (room) {
			room.addUpdateUser ({name : "test", vote : "5" });
			expect(room.users.length).toEqual(1);
		}));

		//changing the vote
		it("should change the user vote", inject(function (room) {
			var user = {name : "test", vote : "6" };
			room.addUpdateUser(user);
			user.vote = "7";
			room.addUpdateUser(user);
			expect(room.users[0].vote).toEqual("7");
		}));

		//revealing the votes
		it("should change the vote visibility", inject(function (room) {
			room.updateVoteVisibility(true);
			expect(room.voteRevealed).toBe(true);
		}));

	});
});