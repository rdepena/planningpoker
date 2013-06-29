(function (planningShark) {

	//poker contains all the functionality related specifically with planning poker.
	planningShark.poker =  {};

	//createCtrl is in charge of creating the channel.
	planningShark.poker.createCtrl = function ($scope, $location) {

		//we create a random string to be used as a channel ID.
		$scope.join = function() {
			$location.path('/channel/' + Math.random().toString(36).substring(7) + '/' + $scope.userName + '/true');
		};
	};

	//joinCtrl is in charge of how users join existing channels.
	planningShark.poker.joinCtrl = function ($scope, $location, $routeParams) {
	
		//this property represents the existing channel Id that we will join.
		$scope.channelId = $routeParams.channelId;
		//we join a channel that has been passed via the route params.
		$scope.join = function () {
			//TODO: find a way to add this to a module, think messaging or planning.....?
			$location.path('/channel/' + $scope.channelId + '/' + $scope.userName); 
		};
	};

	//channelCtrl is responsible for all events and actions you can take while in a channel.
	planningShark.poker.channelCtrl = function ($scope, $http, $location, $routeParams, Messaging, events, deck) {

		//public members:
		$scope.currentUser = { name : $routeParams.userName };
		$scope.channelId = $routeParams.channelId;
		$scope.isMaster = $routeParams.master === 'true';
		//TODO: configure different card 'decks'
		$scope.deck = deck;
		$scope.users = [$scope.currentUser];
		//Todo:Get better name.
		$scope.voteCounts = [];

		//public functions:

		//handles the voting logic
		$scope.vote = function(card) {
			$scope.currentUser.vote = card;
			Messaging.publish({eventType : 'vote', vote : card, name : $scope.currentUser.name});
		}
		//accepts true or false and changes the state of vote visibility accordingly 
		$scope.toggleVoteVisibility = function (val) {
			//only allow this if its the 'scrum' master
			if($scope.isMaster) {
				$scope.revealed = val ;
				Messaging.publish(
				{
					eventType : events.VOTE_VISIBILITY_TOGGLE, 
					reveal : $scope.revealed 
				});
			}
		}
		//handles the reset vote logic.
		$scope.resetVotes = function () {
			//only allow this if its the 'scrum' master
			if($scope.isMaster) {
				Messaging.publish({eventType : events.VOTE});
			}
		}

		//private functions:

		//Adds a user to the current user list.
		var addUser = function (user) {
			$scope.$apply(function (){
				$scope.users.push(user);
			});
		}

		//generates a summary view of the votes.
		var generatevoteCounts = function () {
			//we clear the existing vote summary
			$scope.voteCounts = []

			//loop each user and determine what they voted.
			angular.forEach($scope.users, function (u) {
			
				//we check to see if this vote is alredy 
				var vote = null;
				angular.forEach($scope.voteCounts, function (v) {
					if (v.vote == u.vote) {
						vote = v;					}
				});

				//if a user already voted using this value add 1 to it.
				if (vote != null) {
					vote.count++;
				}
				//if its the first or only user voting for this number add it to the vote summary.
				else {
					$scope.voteCounts.push({
						vote : u.vote,
						count : 1
					});
				}
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

		//anounce to everyone in the channel that a particular user has joined.
		var anounceAttendance = function () {
			Messaging.publish(
				{ 
					eventType : events.USER_VOTE, 
					name : $scope.currentUser.name 
				});
		}

		//Event handlers to react to messaging.

		//we take action on Another user joining.
		var onPeerJoin = function (message) {
			if(!userExists(message.name, angular.noop)) {
				addUser({name : message.name});
				anounceAttendance();
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
				addUser(
					{ name : message.name, 
						vote : message.vote
					});
			}
			//Make sure that the summaries are updated.
			$scope.$apply(function () {
				generatevoteCounts();
			});
		}
		//action to be executed upon joining the channel
		var onConnect = function () {
			anounceAttendance();
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
				$scope.currentUser.vote = null;
				angular.forEach($scope.users, function(u){
					u.vote = null;
					$scope.revealed = false;
				})
			});
		}

		//TODO: display better error messages.
		var onDisconnect = function (message) {
			//TODO: implement better error messaging.
			console.log('connected');
		}

		//TODO: 
		var onReconnect = function (message) {
			//TODO: implement better error messaging.
			console.log('disconnected');
		}
		
		//All messages will be processed.
		var processMessage = function(message) {

			//determine what event has taken place
			if(message.eventType === events.VOTE) {
				onPeerVote(message);
			}
			if(message.eventType === events.USER_JOIN && message.name !== $scope.currentUser.name) {
				onPeerJoin(message);
			}
			if(message.eventType === events.VOTE_VISIBILITY_TOGGLE) {
				onToggle(message);
			}
			if(message.eventType === events.RESET_VOTE) {
				onReset(message);
			}
		}	
		//sets up the messaging subscription.
		var options = {
			channel : $scope.channelId,
			message : processMessage,
			connect : onConnect, 
			disconnect : onDisconnect, 
			reconnect : onReconnect,
			keepAlive : $scope.isMaster
		}
		//we use messaging to abstract any subscription policy.
		Messaging.subscribe(options);
	}
	
})(this.planningShark = this.planningShark || {});