/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
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