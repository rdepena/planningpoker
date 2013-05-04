angular.module('timer', [])
.factory('Timer', function (){

	//Private members"
	self = this;
	var Timer = {};
	self.seconds = 0;
	self.doneCallback;
	self.tickCallback;
	self.stopTimer = false;

	//private functions:
	var tick = function () {
		console.log(self.seconds);
		if(self.seconds === 0) {
			self.doneCallback(self.seconds);
			return;
		}
		if (self.stopTimer) {
			return;
		}
		self.seconds--;
		self.tickCallback(self.seconds);
		setTimeout(tick, 1000);
	}

	//public functions:
	Timer.start = function (seconds, onFinish, onTick) {
		self.seconds = seconds;
		self.doneCallback = onFinish;
		self.tickCallback = onTick;
		console.log("Started timer");
		self.stopTimer = false;
		tick();

	};
	Timer.stop = function () {
		self.stopTimer = true;
	}
	Timer.addTime = function (seconds) {
		self.seconds += seconds;
	}
	return Timer;
});