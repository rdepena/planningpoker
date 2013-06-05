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
		.otherwise({redirectTo:'/'});
	});

	//configure directives:
	planningShark.app.directive("psTimer", planningShark.directives.simpleTimer);
	planningShark.app.filter('timerFormat', planningShark.directives.timerFormat);

})(this.planningShark = this.planningShark || {});