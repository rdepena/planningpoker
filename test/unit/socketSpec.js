/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global jasmine, describe, beforeEach, it, inject, expect, rtms, angular, spyOn*/


// Jasmine spec for the socket service.
var io;
describe('socket spec', function () {
	'use strict';
	
	var rtms;
	beforeEach(function () {
		//set up the module.
		module("planningShark.services", "planningShark");
		io = jasmine.createSpyObj('io', ['connect']);
		rtms = jasmine.createSpyObj('rtms', ['on', 'emit']);
		io.connect.andCallFake(function (){
			return rtms;
		});
	});
	describe('socket service', function () {
		describe("subcribe function ", function () {
			it("should emit a room on subscibe", inject(function (socket) {
				//wire up
				var roomName = 'testRoom';
				var options = { roomName : roomName };
				socket.subscribe(options);

				//expects
				expect(rtms.emit).toHaveBeenCalledWith("joinRoom", {room : roomName});
			}));

			it("should subbscribe with the on event", inject(function (socket) {
				//wire up
				var roomName = 'testRoom';
				var options = { roomName : roomName };
				socket.subscribe(options);

				//expects
				expect(rtms.on).toHaveBeenCalled();

			}));
		});

		describe("publish function", function () {
			it("should emit a broadcast", inject(function (socket) {
				//wire up
				var msg = "something",
					roomName = 'testRoom';
				socket.subscribe({roomName : roomName});
				socket.publish(msg);

				//expects
				expect(rtms.emit).toHaveBeenCalledWith('broadcast', {room : roomName, message : msg});

			}));
		});
	});
});