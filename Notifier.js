(function(){

	angular.module('Notifier', [])
	
	.directive('notifier', function(Notifier){

		return{
			transclude: false, // this is left this way to work in IE8... IE8....
			replace: true,
			template:       '<ul class="Notifier">'+
								'<li ng-repeat="notification in notifications" class="Notifier-notification">'+
									'<i class="Icon-notification-{{ notification.type }}"></i>'+
									'<span class="Notifier-message">{{ notification.text }}</span>'+
									'<div class="Notifier-actions">'+
										'<a ng-show="notification.data" ng-click="viewData(notification.data)" class="view-data">View</a>'+
										'<a ng-show="notification.xhrToken" ng-click="retry(notification.xhrToken)" class="retry">Retry</a>'+
										'<a ng-click="remove(notification)" class="remove">Close</a>'+
									'</div>'+
								'</li>'+
							'</ul>',
			link: function( $scope, element, attr ){

				// seconds to show non-indefinite notifications
				// default to 3 sec
				$scope.notifications = Notifier.notifications;

				$scope.remove = function( notification ){
					var index = Notifier._getNotificationIndexByID(notification.id);
					Notifier._removeNotification(index);
				},

				// a notification can contain information set 
				// at the time of creation. This is passed
				// up through an event
				$scope.viewData = Notifier.sendNotificationData;

				$scope.retry = function(token){
					Notifier.retry(token);
				};
			}
		}
	})
	
	.service('Notifier', function($timeout, $http, $rootScope){
		
		var self = this;
		self.notifications = [];
		self.timing = 3000; 
		
		self.notify = function( id, text, type ){

			var index,
				n;

			n = {id: id, text: text, type: type};
			
			// remove any event with this id
			// all progress events should be captured and removed
			// here
			index = self._getNotificationIndexByID(n.id);

			if( index !== undefined )
				self._removeNotification(index);


			// for timed out notifications we set the timeout here 
			if( n.type == 'progress' || n.type == 'indefinite' ){
				self._addIndefiniteNotification(n);
			}else{
				self._addTimedNotification(n);
			}
		}

		self.retry = function( xhrToken ){
			$http(xhrToken);
		}

		self._getNotificationIndexByID = function( id ){
			for (var i = 0; i < self.notifications.length; i++) {
				notificationInArray = self.notifications[i];
				if( id == notificationInArray.id ){
					return i;
				}
			};	
		}

		self.sendNotificationData = function(data){
			$rootScope.$emit('Notifier.VIEW_DATA', data);
		}

		self._removeNotification = function( index ){
			if( index === undefined )return;
			self.notifications.splice(index,1);
		}
		
		self._addTimedNotification = function( notification ){
			self.notifications.push( notification );

			$timeout(function(){
				// remove the notification from the array
				var index = self._getNotificationIndexByID(notification.id);
				self._removeNotification(index);
			}, self.timing);
		}

		self._addIndefiniteNotification = function( notification ){
			self.notifications.push(notification);
		}

	});

})();