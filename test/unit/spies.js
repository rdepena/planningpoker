/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global jasmine, describe, beforeEach, it, inject, expect, angular, spyOn*/

'use strict';
//set up fakes for SocketIO
var rtms = jasmine.createSpyObj('rtms', ['on', 'emit']);
var io = jasmine.createSpyObj('io', ['connect']);
io.connect.andCallFake(function () {
    //socket IO's connect function will return our spy object.
    return rtms;
});

//set up fakes for Jquery Cookie plugin.
var $ = jasmine.createSpyObj('$', ["cookie", 'removeCookie']);
