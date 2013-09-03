/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global jasmine, describe, beforeEach, it, inject, planningShark, expect, rtms, angular, spyOn*/

var $;

describe('controller spec', function () {
	"use strict";
	var location;
	beforeEach(function () {
		//set up the module.
		module("planningShark.services", "planningShark");
		//we will use this user over and over again.
		location = jasmine.createSpyObj("location", ["path"]);
		$ = jasmine.createSpyObj('$', ["cookie", 'removeCookie']);
	});

	describe('createCtrl function', function () {
		it("should change the location path upon joining", inject(function ($rootScope, $controller) {
			//wire up
			var scope = $rootScope.$new();
			var controller = $controller(planningShark.poker.createCtrl, {
				$scope : scope,
				$location : location
			});
			scope.userName = "testName";
			scope.join();

			//expects
			expect(location.path).toHaveBeenCalled();
		}));

		it('should declare open Sessions upon creation', inject(function ($rootScope, $controller) {
			//wire up
			var scope = $rootScope.$new();
			var controller = $controller(planningShark.poker.createCtrl, {
				$scope : scope,
				$location : location
			});

			//expects
			expect(scope.openSessions).not.toBeUndefined();
		}));

		it('should delete should remove a cookie', inject(function ($rootScope, $controller) {
			//wire up
			var scope = $rootScope.$new();
			var controller = $controller(planningShark.poker.createCtrl, {
				$scope : scope,
				$location : location
			});
			var session = {
				name : "testSessionName"
			};
			scope.delete(session);

			//expects
			expect($.removeCookie).toHaveBeenCalledWith(session.name);

		}));

	});
});