(function (planningShark) {
	//we create our planning poker app
	planningShark.app = angular.module('planningShark', ['pubnub']);

	//configure our planning module.:
	planningShark.app.config( function ($routeProvider) {
		$routeProvider
		.when('/', { controller : planningShark.poker.createCtrl, templateUrl : 'createjoin.html' })
		.when('/channel/:channelId/:userName', {controller : planningShark.poker.channelCtrl, templateUrl: 'channel.html'})
		.when('/channel/:channelId/:userName/:master', {controller : planningShark.poker.channelCtrl, templateUrl: 'channel.html'})
		.when('/join/:channelId', { controller : planningShark.poker.joinCtrl, templateUrl : 'createjoin.html'})
		//TODO: get a real 404 page.
		.otherwise({redirectTo:'fourowfour'});
	});

	//configure directives:
	planningShark.app.directive("psTimer", planningShark.directives.simpleTimer);

})(this.planningShark = this.planningShark || {});