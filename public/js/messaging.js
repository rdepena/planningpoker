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
		console.log(options);
		channel = options.channel;
		pubnub.subscribe({
			channel : options.channel,
			message : options.message,
			connect : options.connect,
			disconnect : options.disconnect,
			reconnect : options.reconnect,
			presence : options.presence
		});
	};	

	return Messaging;
});