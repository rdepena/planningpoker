(function (planningShark) {
	//we create our planning poker app
	planningShark.app = angular.module('planningShark', ['planningShark.services']);

	//configure our planning module.:
	planningShark.app.config( function ($routeProvider) {
		$routeProvider
		.when('/', { controller : planningShark.poker.createCtrl, templateUrl : 'createjoin.html' })
		.when('/room/:roomName/:userName', {controller : planningShark.poker.roomCtrl, templateUrl: 'room.html'})
		.when('/room/:roomName/:userName/:master', {controller : planningShark.poker.roomCtrl, templateUrl: 'room.html'})
		.when('/join/:roomName', { controller : planningShark.poker.joinCtrl, templateUrl : 'createjoin.html'})
		.otherwise({redirectTo:'/'});
	});

	//set up constants:
	//application events.
	planningShark.app.constant('events', 
		{ 
			VOTE_RESET : 'reset',
			VOTE : 'vote',
			USER_JOIN : 'join',
			VOTE_VISIBILITY_TOGGLE : 'toggle',
			ROOM_STATUS : 'roomStatus'
		});
	//card deck.
	planningShark.app.constant('deck', ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', 'coffee']);

})(this.planningShark = this.planningShark || {});