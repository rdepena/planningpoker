//Todo: Create Modules.
angular.module('planning', ['pubnub']).config(function($routeProvider){
	$routeProvider
	.when('/', { controller : createCtrl, templateUrl : 'templates/createjoin.html' })
	.when('/channel/:channelId/:userName', {controller : channelCtrl, templateUrl: 'templates/channel.html'})
	.when('/channel/:channelId/:userName/:host', {controller : channelCtrl, templateUrl: 'templates/channel.html'})
	.when('/join/:channelId', { controller : joinCtrl, templateUrl : 'templates/createjoin.html'})
	.otherwise({redirectTo:'fourofour'});
});	
	
	
//Create controller.
function createCtrl ($scope, $location) {

		$scope.join = function() {
			$location.path('/channel/' + Math.random().toString(36).substring(7) + '/' + $scope.userName + '/true');
		};
}

//Join controller.
function joinCtrl ($scope, $location, $routeParams) {
	$scope.channelId = $routeParams.channelId;

	$scope.join = function () {
		//TODO: find a way to add this to a module, think messaging or planning.....?
		$location.path('/channel/' + $scope.channelId + '/' + $scope.userName); 
	}
}

//Channel controller.
function channelCtrl($scope, $http, $location, $routeParams, Messaging) {
	$scope.currentUser = { name : $routeParams.userName };
	$scope.channelId = $routeParams.channelId;
	$scope.isHost = $routeParams.host === 'true';
	console.log($scope.isHost);
	$scope.cards = ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'];
	$scope.users = [];

	//we take action on Another user joining.
	var userJoined = function (message) {
		if(!userExists(message.name, function(){;})) {
			addUser({name : message.name});
		}
	}

	var addUser = function (user) {
		$scope.$apply(function (){
			$scope.users.push(user);
		});
	}

	var userExists = function (name, onExists) {
		var retuser;
		angular.forEach($scope.users, function(u){
			if(u.name === name) {
				retuser = u;
				onExists(u);
			}
		});
		return retuser; 
	}

	//we take action on another user voting.
	var userVoted = function (message) {
		var user = userExists(message.name, function(u){
			//u.name = "updated";
			$scope.$apply(function () {
				u.vote = message.vote;
			});
		});
		if(!user) {
			addUser({ name : message.name, vote : message.vote });
		}
	}
	//action to be executed upon joining the channel
	var joinAction = function () {
		Messaging.publish({ eventType : 'join', name : $scope.currentUser.name });
	};

	var toggleEvent = function (message) {
		$scope.$apply(function() {
			$scope.revealed = message.reveal;	
		})
	};
	var resetEvent = function (message) {
		$scope.$apply(function (){
			$scope.currentUser.vote = '';
			angular.forEach($scope.users, function(u){
				u.vote = '';
				$scope.revealed = false;
			})
		});
	}
	//sets up the events to listen to.
	var subscribeAction = function(message) {
		if(message.eventType === 'vote') {
			userVoted(message);
		}
		if(message.eventType === 'join' && message.name !== $scope.currentUser.name) {
			userJoined(message);
		}
		if(message.eventType === 'toggle') {
			toggleEvent(message);
		}
		if(message.eventType === 'reset') {
			resetEvent(message);
		}
	}	
	//sends the vote message.
	$scope.vote = function(card) {
		$scope.currentUser.vote = card;
		Messaging.publish({eventType : 'vote', vote : card, name : $scope.currentUser.name});
	}
	//TODO: work on a naming convention.
	$scope.toggleVotes = function () {
		if($scope.isHost) {
			$scope.revealed = !$scope.revealed ;
			Messaging.publish({eventType : 'toggle', reveal : $scope.revealed });
		}
	}
	$scope.resetVotes = function () {
		if($scope.isHost) {
			Messaging.publish({eventType : 'reset'});
		}
	}
	//sets up the messaging subscription.
	Messaging.subscribe(subscribeAction, joinAction, $scope.channelId);
}