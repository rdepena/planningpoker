//this object's responsability is to be a container of our directives.
(function (planningShark) {

	//not sure if this is the only place I will declare directives so don't overwrite them.
	planningShark.directives = planningShark.directives || {};
	planningShark.directives.simpleTimer = function () {
		return {
			restrict : 'A', 
			transclude : false ,
			template : 
				'<p>' +
	                'timer' +
	                '<button ng-click="addMinutes()" class="btn btn-small">+1</button>' +
	                '<strong>{{time.minutes | timerFormat}}:{{time.seconds | timerFormat}}</strong>' +
	                '<button ng-click="startTimer()" class="btn btn-small btn-primary">start</button>' +
	                '<button ng-click="resetTimer()" class="btn btn-small btn-inverse">reset</button>' + 
	             '</p>',
	        replace : true,
			controller : function ($scope) {
				self = this;
				self.running = false;
				self.seconds = 0;
				self.stopTimer = false;

				//model object of time.
				$scope.time = {
					minutes : 1,
					seconds : 0
				};

				//private functions:

				//will execute every second and update scope variables.
				var tick = function () {
					self.running = true;
					if(self.seconds === 0) {
						alert('ding');
						self.running = false;
						return;
					}
					if (self.stopTimer) {
						self.running = false;
						return;
					}
					self.seconds--;
					var update = function () {
						$scope.time.minutes = Math.floor(self.seconds / 60);
						$scope.time.seconds = self.seconds % 60;
					}
					 var phase = $scope.$root.$$phase;
					  if(phase == '$apply' || phase == '$digest') {
					      update();
					  } else {
					    $scope.$apply(update);
					  }
					setTimeout(tick, 1000);
				};

				//model functions:

				//initiates the timer.
				$scope.startTimer = function () {
					if (!self.running) {
						var timeInSeconds = $scope.time.minutes  * 60;
						self.seconds = timeInSeconds;
						self.stopTimer = false;
						tick();
					}
				};

				//Adds one minute to the timer.
				$scope.addMinutes = function() {
					$scope.time.minutes++;
					self.seconds += 60;
				};

				//stops the timer then resets it to 60 seconds.
				$scope.resetTimer = function () {
					self.stopTimer = true;
					$scope.time.minutes = 1;
					$scope.time.seconds = 0;
				};
			}
		}
	}
	//this filter is a pre-requisit for the timer
	planningShark.directives.timerFormat = function () {  
		return function (input) {
			return input < 9 ? "0" + input : input;
		}
	};


})(this.planningShark = this.planningShark || {});