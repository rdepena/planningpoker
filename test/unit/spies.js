/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global jasmine, describe, beforeEach, it, inject, expect, angular, spyOn*/

'use strict';
//set up fakes for SocketIO
var io = jasmine.createSpyObj('io', ['connect']);
io.connect.andCallFake(function () {
    return {
		on : function () { return null; },
		emit : function () { return null; }
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
