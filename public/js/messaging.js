angular.module('pubnub', [])
.factory('Messaging', function($http) {

	var Messaging = {};
	var pchannel = '';
	var pubnub = PUBNUB.init({
		publish_key : 'usepubkeyhere',
		subscribe_key :  'usesubkeyhere'
	});

	Messaging.publish = function (msg) {
		$http.post('/pushmessage', {channel : pchannel, message : msg})
	}

	Messaging.subscribe = function (callback, joinAction, channel) {
		pchannel = channel;
		pubnub.subscribe({
			channel : channel,
			message : callback,
			connect : joinAction,
			presence : function (message) {
				console.log('this is presence' + message, true)
			}
		});
	};	

	return Messaging;
});