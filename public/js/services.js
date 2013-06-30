(function (planningShark) {

'use strict';
 
	planningShark.services = angular.module("services", []);
	
	//register other services here...
	
	/* pubsub - based on https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js*/
	planningShark.services.factory('pubsub', function ($rootScope) {
		//we will return this object.
		var my = {};

		//I keep a copy of the events and their unsubscribe functions that are returned by the $on call.
		var events = {};

        //callback format is function (data). we can modify it later to accept function (event, data) if needed
		my.subscribe = function (event, callback) {
		    var unsubcribeFunction = $rootScope.$on(event, function (onEvent, data) { callback(data); });

		    if (!events[event]) {
		        events[event] = [];
			}

		    var eventObject =
		    {
		        callback: callback,
		        unsubscribeFunction: unsubcribeFunction
		    };

		    events[event].push(eventObject);
		};
		
		my.publish = function (event, data) {
		    $rootScope.$broadcast(event, data);
		};
		
		my.unsubscribe = function (event, callback) {
		    var eventsArray = events[event];
			angular.forEach(eventsArray, function (value, key) {
				if(value.callback == callback) {
				    value.unsubscribeFunction();
				    eventsArray.splice(key, 1);
				}
			});
		};

		return my;
	});

	planningShark.services.factory('participants', function (){
		var my = {}

		my.participantList = [];

		my.voteCount = function () {
			var vc = [];
			angular.forEach(my.participantList, function(u) {
				//we check to see if this vote is alredy 
				var vote = null;
				angular.forEach(vc, function (v) {
					if (v.vote == u.vote) {
						vote = v;
					}
				});

				//if a user already voted using this value add 1 to it.
				if (vote != null) {
					vote.count++;
				}
				//if its the first or only user voting for this number add it to the vote summary.
				else {
					vc.push({
						vote : u.vote,
						count : 1
					});
				}
			});
			return vc;
		};

		//helper functions:
		var participantExists = function (name, onExists) {
			var retparticipant;
			angular.forEach(my.participantList, function(p){
				if(p.name === name) {
					retparticipant = p;
					if(angular.isFunction(onExists)) {
						onExists(p);	
					}
				}
			});
			return retparticipant; 
		}

		my.add = function (participant) {
			if(!participantExists(participant.name)) {
				my.participantList.push(participant);
			}
		};

		my.updateVote = function (participant) {
			var existingParticipant = participantExists(participant.name);
			if(existingParticipant) {
				existingParticipant.vote = participant.vote;
			}
			else {
				my.participantList.push(participant);
			}
		};

		my.resetVotes = function () {
			angular.forEach(my.participantList, function (p){
				p.vote = null;
			});
		}

		return my;

	});

	planningShark.services.factory('Messaging', function($http) {

		//we will return this object, add any public properties/methods to it.
		var my = {};
		//we hold a copy of the channel as to not request it on every call
		var channel = '';
		//pubnub configuration.
		var pubnub = PUBNUB.init({
			subscribe_key :  ""
		});

		//we publish to our node instance not pubnub.
		my.publish = function (msg) {
			$http.post('/publish', { channel : channel, message : msg})
		}

		//we subscribe directly to pubnub.
		my.subscribe = function (options) {
			//local variable saves the channel for latter use.
			channel = options.channel;

			//configure pubnub subscription.
			pubnub.subscribe({
				channel : options.channel,
				message : options.message,
				connect : options.connect,
				disconnect : options.disconnect,
				reconnect : options.reconnect,
				presence : options.presence
			});

			//keep alive hack : will remove this once I re-write this using socket IO or comparable solution.
			var keepAlive = function () {
				my.publish("k");
				setTimeout(keepAlive, 60000);
			}
			if(options.keepAlive) {
				setTimeout(keepAlive, 60000);
			}	
		};	
		return my;
	});

	return planningShark.services;

})(this.planningShark = this.planningShark || {});