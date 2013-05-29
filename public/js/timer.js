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
		controller : function ($scope) {
			self = this;
			var Timer = {};
			self.seconds = 0;
			self.stopTimer = false;

			//is this neccessary ? 
			$scope.time = {
				minutes : 1,
				seconds : 0
			};

			//private functions:
			var tick = function () {
				if(self.seconds === 0) {
					alert('ding');
					return;
				}
				if (self.stopTimer) {
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
				console.log("tick");
				setTimeout(tick, 1000);
			}
			$scope.startTimer = function () {
				var timeInSeconds = $scope.time.minutes  * 60;
				self.seconds = timeInSeconds;
				self.stopTimer = false;
				tick();
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
		},
		replace : true
	}
}