/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global jasmine, describe, beforeEach, it, inject, expect, rtms, angular, spyOn*/

'use strict';
// Jasmine spec for the socket service.

describe('socket spec', function () {
	beforeEach(function () {
		//set up the module.
		module("planningShark.services", "planningShark");

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