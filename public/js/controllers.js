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
			cookies.add(roomName, { name : roomName, path: path, joinDate : Date.now()}, {expires : 1});
			$location.path(path);
		};

		$scope.delete = function (cookie) {
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
			cookies.add(roomName, { path: path, joinDate : Date.now()}, {expires : 1});
			$location.path(path); 
		};	
	};

	//channelCtrl is responsible for all events and actions you can take while in a channel.
	planningShark.poker.channelCtrl = function ($scope, $http, $location, $routeParams, socket, events, deck, pubsub, participants, cookies) {
		//public members:
		$scope.currentUser = { name : $routeParams.userName };
		participants.add($scope.currentUser);
		$scope.channelId = $routeParams.channelId;
		$scope.isMaster = $routeParams.master === 'true';
		//TODO: configure different card 'decks'
		$scope.deck = deck;
		$scope.users = participants.participantList;
		//Todo:Get better name.

		//handles the voting logic
		$scope.vote = function(card) {
			$scope.currentUser.vote = card;
			socket.publish({eventType : events.VOTE, vote : card, name : $scope.currentUser.name});
		};
		//accepts true or false and changes the state of vote visibility accordingly 
		$scope.updateVoteVisibility = function (val) {
			//only allow this if its the 'scrum' master
			if($scope.isMaster) {
				$scope.revealed = val;
				socket.publish(
				{
					eventType : events.VOTE_VISIBILITY_TOGGLE, 
					reveal : $scope.revealed 
				});
			}
		};
		//handles the reset vote logic.
		$scope.resetVotes = function () {
			//only allow this if its the 'scrum' master
			participants.resetVotes();
			if($scope.isMaster) {
				socket.publish({eventType : events.VOTE_RESET});
			}
		};

		//subscribe to messages: 
		pubsub.subscribe(events.VOTE, function (message) {
			$scope.$apply(function() {
				participants.updateVote(
					{
						name : message.name,
						vote : message.vote 
					});
				$scope.voteCounts = participants.voteCount();
			});
		});

		pubsub.subscribe(events.USER_JOIN, function (message) {
			$scope.$apply(function() {
				participants.add({
					name : message.name,
					vote : message.vote
				});
			});
		});

		pubsub.subscribe(events.VOTE_VISIBILITY_TOGGLE, function (message) {
			$scope.$apply(function (){
				$scope.revealed = message.reveal;
			});
			
		});

		pubsub.subscribe(events.VOTE_RESET, function (message) {
			$scope.$apply(function() {
				participants.resetVotes();
				$scope.updateVoteVisibility(false);
				$scope.voteCounts = participants.voteCount();
			});
		});

		pubsub.subscribe(events.ROOM_STATUS, function (message){
			angular.forEach(message.room.participants, function (p) {
				participants.add ({
					name : p.name,
					vote : p.vote
				});
			});
			$scope.revealed = message.room.displayVotes;
		});

		//sets up the socket subscription.
		var options = {
			channel : $scope.channelId,
			message : function (message) {
				pubsub.publish(message.eventType, message);
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