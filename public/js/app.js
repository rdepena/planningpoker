//Todo: Create Modules.
angular.module('planning', ['pubnub']).config(function($routeProvider){
	$routeProvider
	.when('/', { controller : createCtrl, templateUrl : 'templates/createjoin.html' })
	.when('/channel/:channelId/:userName', {controller : channelCtrl, templateUrl: 'templates/channel.html'})
	.when('/channel/:channelId/:userName/:master', {controller : channelCtrl, templateUrl: 'templates/channel.html'})
	.when('/join/:channelId', { controller : joinCtrl, templateUrl : 'templates/createjoin.html'})
	.otherwise({redirectTo:'fourowfour'});
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
	$scope.isMaster = $routeParams.master === 'true';
	$scope.cards = ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'];
	$scope.users = [];

	//UI events:

	//sends the vote message.
	$scope.vote = function(card) {
		$scope.currentUser.vote = card;
		Messaging.publish({eventType : 'vote', vote : card, name : $scope.currentUser.name});
	}
	//TODO: work on a naming convention.
	$scope.toggleVotes = function () {
		if($scope.isMaster) {
			//TODO: this is not the best way to accomplish this.
			$scope.revealed = !$scope.revealed ;
			Messaging.publish({eventType : 'toggle', reveal : $scope.revealed });
		}
	}
	$scope.resetVotes = function () {
		if($scope.isMaster) {
			Messaging.publish({eventType : 'reset'});
		}
	}

	//private functions:

	//Adds a user to the current user list.
	var addUser = function (user) {
		$scope.$apply(function (){
			$scope.users.push(user);
		});
	}

	//checks if a user exists in the current user list, callback upon finding him
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

	//Events Triggered by Messaging:

	//we take action on Another user joining.
	var onPeerJoin = function (message) {
		if(!userExists(message.name, function(){;})) {
			addUser({name : message.name});
		}
	}

	//we take action on another user voting.
	var onPeerVote = function (message) {
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
	var onConnect = function () {
		Messaging.publish({ eventType : 'join', name : $scope.currentUser.name });
	};

	//visibility has been toggled by the master
	var onToggle = function (message) {
		$scope.$apply(function() {
			$scope.revealed = message.reveal;	
		})
	};

	//vote reset has been initiated by master
	var onReset = function (message) {
		$scope.$apply(function (){
			$scope.currentUser.vote = '';
			angular.forEach($scope.users, function(u){
				u.vote = '';
				$scope.revealed = false;
			})
		});
	}

	//TODO: display better error messages.
	var onDisconnect = function (message) {
		//TODO: implement better error messaging.
		console.log(message);
	}

	//TODO: 
	var onReconnect = function (message) {
		//TODO: implement better error messaging.
		console.log(message);
	}

	var onPresence = function (message) {
		//TODO: use presence to determine who is on.
		console.log(message);
	}


	
	//All messages will be processed.
	var onMessage = function(message) {

		//determine what event has taken place
		if(message.eventType === 'vote') {
			onPeerVote(message);
		}
		if(message.eventType === 'join' && message.name !== $scope.currentUser.name) {
			onPeerJoin(message);
		}
		if(message.eventType === 'toggle') {
			onToggle(message);
		}
		if(message.eventType === 'reset') {
			onReset(message);
		}
	}	
	//sets up the messaging subscription.
	var options = {
		channel : $scope.channelId,
		message : onMessage,
		connect : onConnect, 
		disconnect : onDisconnect, 
		reconnect : onReconnect, 
		presence : onPresence
	}
	Messaging.subscribe(options);
}