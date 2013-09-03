/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global jasmine, describe, beforeEach, it, inject, expect, angular*/

//we test the room.
var io;
describe('room spec:', function () {
	'use strict';
	//variables we will use for this test.
	var user = {};

	beforeEach(function () {
		//set up the module.
		module("planningShark.services", "planningShark");
		//we will use this user over and over again.
		user = {name : "test", vote : "6" };
		io = jasmine.createSpyObj('io', ['connect']);
		io.connect.andCallFake(function (){
			return jasmine.createSpyObj('rtms', ['on', 'emit']);
		});

	});
	describe("room service", function () {

		//adding a user.
		it("should add a user", inject(function (room) {
			//wire up
			room.addUpdateUser(user);

			//expects
			expect(room.users.length).toEqual(1);
		}));

		//changing the vote
		it("should change the user vote", inject(function (room) {
			//wire up
			room.addUpdateUser(user);
			user.vote = "7";
			room.addUpdateUser(user);

			//expects
			expect(room.users[0].vote).toEqual("7");
		}));

		//revealing the votes
		it("should change the vote visibility", inject(function (room) {
			//wire up
			room.updateVoteVisibility(true);

			//expects
			expect(room.voteRevealed).toBe(true);
		}));

		//updating vote visibility
		it("should reset the votes and vote visibility.", inject(function (room) {
			//wire up
			room.updateVoteVisibility(true);
			room.addUpdateUser(user);
			room.resetVotes(false);

			//expects
			expect(room.voteRevealed).toBe(false);
			expect(room.users[0].vote).toBeNull();

		}));

		//room setup
		it("should wire up the room correctly", inject(function (room) {
			//wire up
			var roomName = "TestRoomName";
			room.setupRoom(roomName);

			//expects
			expect(room.roomName).toEqual(roomName);
			expect(room.users.length).toBe(0);
			expect(room.voteRevealed).toBe(false);
			expect(room.voteCount).toBeNull();
		}));

		//vote count
		it("should provide a correct vote count", inject(function (room) {
			//wire up
			var user2 = {name : "test2", vote : "6"};
			var user3 = {name : "test3", vote : "7"};
			room.addUpdateUser(user);
			room.addUpdateUser(user2);
			room.addUpdateUser(user3);
			room.calcVoteCount();

			//expects
			expect(room.voteCount.length).toEqual(2);
			expect(room.voteCount[0].count).toEqual(2);
			expect(room.voteCount[1].count).toEqual(1);

		}));
	});
});