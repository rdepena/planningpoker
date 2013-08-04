/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global jasmine, describe, beforeEach, it, inject, expect, angular, spyOn*/


'use strict';
// Jasmine spec for the cookies service.

//we test the cookie service..
describe('cookies spec:', function () {
	beforeEach(function () {
		//set up the module.
		module("planningShark.services", "planningShark");

	});

	describe('add function', function () {
		it("should accept and use the three parameters passed.", inject(function (cookies) {
			//wire up
			var name = "testName",
				value = "value",
				options = "options";
			cookies.add(name, value, options);

			//expects
			expect($.cookie).toHaveBeenCalledWith(name, value, options);
		}));
	});

	describe('get function', function () {
		it("should accept and use the name parameter", inject(function (cookies) {
			//wire up
			var name = "testName";
			cookies.get(name);

			//expects
			expect($.cookie).toHaveBeenCalledWith(name);
		}));
	});

	describe('remove function', function () {
		it('should accept and use the name parameter', inject(function (cookies) {
			//wire up
			var name = "testName";
			cookies.remove(name);

			//expects
			expect($.removeCookie).toHaveBeenCalledWith(name);
		}));
	});
});