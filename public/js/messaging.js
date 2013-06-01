(function (planningShark) {
	//pubnub is our pubnub messaging implementation, this could be replaced with something else at some point.
	planningShark.pubnub = angular.module('pubnub', []);
	
	//we turn the module into a service.
	planningShark.pubnub.factory('Messaging', function($http) {

		//we will return this object, add any public properties/methods to it.
		var my = {};
		//we hold a copy of the channel as to not request it on every call
		var channel = '';
		//pubnub configuration.
		var pubnub = PUBNUB.init({
			subscribe_key :  'sub'
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
		//publish/subscribe functionallity is returned.
		return my;
	});
})(this.planningShark = this.planningShark || {});