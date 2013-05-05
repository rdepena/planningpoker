angular.module('pubnub', [])
.factory('Messaging', function($http) {

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

		var minutes = 60;
		//keep alive hack : will remove this once I re-write this using socket IO or comparable solution.
		var keepAlive = function () {
			if(minutes > 0) {
				Messaging.publish("ka");
				minutes--;
				setTimeout(keepAlive, 60000);
			}
		}
		setTimeout(keepAlive, 60000);
	};	

	return Messaging;
});