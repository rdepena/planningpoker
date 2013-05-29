var simpleTimer = function () {
	return {
		restrict : 'E', 
		transclude : true ,
		template : 
			'<p>' +
                'timer' +
                '<button ng-click="addMinutes()" class="btn btn-small">+1</button>' +
                '<strong>{{timeFormat(time.minutes)}}:{{timeFormat(time.seconds)}}</strong>' +
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
			}
			$scope.startTimer = function () {
				console.log(self.running);
				if (!self.running) {
					var timeInSeconds = $scope.time.minutes  * 60;
					self.seconds = timeInSeconds;
					self.stopTimer = false;
					tick();
				}
			}
			$scope.timeFormat = function (t) {
				return t < 9 ? "0" + t : t;
			}
			//Adds one minute to the timer.
			$scope.addMinutes = function() {
				$scope.time.minutes++;
				self.seconds += 60;
			};
			$scope.resetTimer = function () {
				self.stopTimer = true;
				$scope.time.minutes = 1;
				$scope.time.seconds = 0;
			}
		}
	}
}