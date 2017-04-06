/*jslint indent: 4, maxerr: 50, vars: true, nomen: true*/
/*global planningShark, angular*/

(function (planningShark) {
	"use strict";

	//we create our planning poker app
	planningShark.app = angular.module('planningShark', ['planningShark.services']);

	//configure our planning module.:
	planningShark.app.config(function ($routeProvider) {
		$routeProvider
			.when('/', { controller : planningShark.poker.createCtrl, templateUrl : 'templates/createjoin.html' })
			.when('/room/:roomName/:deckName/:userName', {controller : planningShark.poker.roomCtrl, templateUrl: 'templates/room.html'})
			.when('/room/:roomName/:deckName/:userName/:master', {controller : planningShark.poker.roomCtrl, templateUrl: 'templates/room.html'})
			.when('/join/:roomName/:deckName', { controller : planningShark.poker.joinCtrl, templateUrl : 'templates/createjoin.html'})
			.otherwise({redirectTo: '/'});
	});

	//set up constants:
	//application events.
	planningShark.app.constant('events',
		{
			VOTE_RESET : 'reset',
			VOTE : 'vote',
			USER_JOIN : 'join',
			VOTE_VISIBILITY_TOGGLE : 'toggle'
		});
	//card deck.
	planningShark.app.constant('deck', {a: ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', 'caffeine'], b: ['0', '1', '2', '4', '8', '16', '32', '64', '128', '?']});


})(this.planningShark = this.planningShark || {});
