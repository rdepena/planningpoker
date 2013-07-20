(function (planningShark) {

	"use strict";

	//poker contains all the functionality related specifically with planning poker.
	planningShark.poker =  {};

	//createCtrl is in charge of creating the room.
	planningShark.poker.createCtrl = function ($scope, $location, cookies) {
		$scope.openSessions = cookies.get();
		//we create a random string to be used as a room ID.
		$scope.join = function() {
			var roomName = Math.random().toString(36).substring(7);
			var path = '/room/' + roomName + '/' + $scope.userName + '/true';
			$location.path(path);
		};

		//deletes the session cookie.
		$scope.delete = function (cookie) {
			cookies.remove(cookie.name);
			$scope.openSessions = cookies.get();
		}
	};

	//joinCtrl is in charge of how users join existing rooms.
	planningShark.poker.joinCtrl = function ($scope, $location, $routeParams) {
	
		//this property represents the existing room Id that we will join.
		$scope.roomName = $routeParams.roomName;
		//we join a room that has been passed via the route params.
		$scope.join = function () {
			var path = '/room/' + $scope.roomName + '/' + $scope.userName;
			$location.path(path); 
		};	
	};

	//roomCtrl is responsible for all and actions you can take while in a room.
	planningShark.poker.roomCtrl = function ($scope, $http, $location, $routeParams, deck, room) {
		//set values for the view:
		$scope.currentUser = { name : $routeParams.userName };
		$scope.roomName = $routeParams.roomName;
		$scope.isMaster = $routeParams.master === 'true';
		$scope.deck = deck;
		var path = '/room/' + $scope.roomName + '/' + $scope.currentUser.name;

		//join the room:
		room.setupRoom($scope.roomName);
		$scope.users = room.participants;
		room.join($scope.roomName, path, $scope.currentUser);

		//expose room logic: 

		$scope.voteRevealed =  function () {
			return room.voteRevealed;
		};	
		$scope.voteCounts = function () {
			return room.voteCount;
		}

		//scope functions:

		//handles the voting logic
		$scope.vote = function(card) {
			$scope.currentUser.vote = card;
			room.vote(card, $scope.currentUser);
		};
		//accepts true or false and changes the state of vote visibility accordingly 
		$scope.updateVoteVisibility = function (val) {
			room.updateVoteVisibility(val);	
		};
		//handles the reset vote logic.
		$scope.resetVotes = function () {
			//we send a value to send the notification.
			room.resetVotes(true);
		};
	};
	
})(this.planningShark = this.planningShark || {});