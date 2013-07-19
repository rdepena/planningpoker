(function (planningShark) {

	//poker contains all the functionality related specifically with planning poker.
	planningShark.poker =  {};

	//createCtrl is in charge of creating the channel.
	planningShark.poker.createCtrl = function ($scope, $location, cookies) {
		$scope.openSessions = cookies.get();
		//we create a random string to be used as a channel ID.
		$scope.join = function() {
			var roomName = Math.random().toString(36).substring(7);
			var path = '/channel/' + roomName + '/' + $scope.userName + '/true';
			//1
			$location.path(path);
		};

		$scope.delete = function (cookie) {
			console.log(cookie);
			cookies.remove(cookie.name);
			$scope.openSessions = cookies.get();
		}
	};

	//joinCtrl is in charge of how users join existing channels.
	planningShark.poker.joinCtrl = function ($scope, $location, $routeParams, cookies) {
	
		//this property represents the existing channel Id that we will join.
		$scope.channelId = $routeParams.channelId;
		//we join a channel that has been passed via the route params.
		$scope.join = function () {
			var roomName = $scope.channelId;
			var path = '/channel/' + $scope.channelId + '/' + $scope.userName;
			//cookies.add(roomName, { path: path, joinDate : Date.now()}, {expires : 1});
			$location.path(path); 
		};	
	};

	//channelCtrl is responsible for all events and actions you can take while in a channel.
	planningShark.poker.channelCtrl = function ($scope, $http, $location, $routeParams, socket, events, pubsub, deck, room, cookies) {
		//public members:
		$scope.currentUser = { name : $routeParams.userName };
		$scope.channelId = $routeParams.channelId;
		$scope.isMaster = $routeParams.master === 'true';
		//TODO: configure different card 'decks'
		$scope.deck = deck;
		$scope.users = room.participants;
		$scope.revealed =  function () {
			return room.revealed;
		}
		//Todo:Get better name.

		//join the room:
		var roomName = $scope.channelId;
		var path = '/channel/' + $scope.channelId + '/' + $scope.userName;
		room.join(roomName, path, $scope.currentUser);

		//handles the voting logic
		$scope.vote = function(card) {
			$scope.currentUser.vote = card;
			room.vote(card, $scope.currentUser);
		};
		//accepts true or false and changes the state of vote visibility accordingly 
		$scope.updateVoteVisibility = function (val) {
			//only allow this if its the 'scrum' master
			if($scope.isMaster) {
				room.updateVoteVisibility(val);
			}
		};
		//handles the reset vote logic.
		$scope.resetVotes = function () {
			//only allow this if its the 'scrum' master
			room.resetVotes();
		};

		//sets up the socket subscription.
		var options = {
			channel : $scope.channelId,
			message : function (message) {
				$scope.$apply(function() {
					pubsub.publish(message.eventType, message);
				});
			},
			connect : function () {
				socket.publish({ eventType : events.USER_JOIN, name : $scope.currentUser.name })
			}, 
			keepAlive : $scope.isMaster, 
			userName : $scope.currentUser.name
		}
		//we use socket to abstract any subscription policy.
		socket.subscribe(options);

	};
	
})(this.planningShark = this.planningShark || {});