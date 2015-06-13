angular.module('todoController', ['ui.router'])

	.config(function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/home');

		$stateProvider

/*			// HOME STATES AND NESTED VIEWS ========================================
			.state('home', {
				url: '/home',
				templateUrl: 'index.html'
			})*/

			// ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
			.state('explain', {
				// we'll get to this in a bit
				url: '/explain',
				templateUrl: 'partials/explain.html',
				controller: function($scope) {
					$scope.message = "Hola Vida";
				}
			});

	})


	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$http','Questions', function($scope, $http, Questions) {
		$scope.formData = {};
		$scope.loading = false;


		$scope.questions = [{'Title':'Cual es la distancia de la tierra al sol ?','Subject':'Fsica'}];

        $scope.explain = function($scope, $location) {

			$location.path( "http://www.google.cl" );

		}

		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.searchQuestion = function() {

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.searchText != undefined) {
				$scope.loading = true;

				Questions.get()
					.success(function(data) {
						$scope.questions = data;
						$scope.loading = false;
					});
			}
		};

	}]);
