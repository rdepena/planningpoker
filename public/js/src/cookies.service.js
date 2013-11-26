/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
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
})(this.planningShark = this.planningShark || {});