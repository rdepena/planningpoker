(function (planningShark) {
	//pubnub is our pubnub messaging implementation, this could be replaced with something else at some point.
	planningShark.pubnub = angular.module('pubnub', []);
	
	//we turn the module into a service.
	planningShark.pubnub.factory('Messaging', function($http) {

		var Messaging = {};
		var channel = '';
		var pubnub = PUBNUB.init({
			subscribe_key :  'sub'
		});

		Messaging.publish = function (msg) {
			$http.post('/publish', { channel : channel, message : msg})
		}

		Messaging.subscribe = function (options) {
			channel = options.channel;
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
				Messaging.publish("k");
				setTimeout(keepAlive, 60000);
			}
			if(options.keepAlive) {
				setTimeout(keepAlive, 60000);
			}	
		};	

		return Messaging;
	});
})(this.planningShark = this.planningShark || {});