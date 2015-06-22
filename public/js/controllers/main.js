angular.module('todoController', ['ngRoute'])

	.config(function($routeProvider) {
		$routeProvider

			.when('/', {
				templateUrl : 'partials/home.html',
				controller  : 'mainController'
			})
			.when('/home', {
				templateUrl : 'partials/home.html',
				controller  : 'mainController'
			})

			.when('/explain/:param', {
				templateUrl : 'partials/explain.html',
				controller  : 'explainController'
			})
			.when('/question', {
				templateUrl : 'partials/question.html',
				controller  : 'questionController'
			});


	})

	.controller('explainController', function($scope, $routeParams) {
		$scope.message = $routeParams.param;
	})
	.controller('questionController', ['$scope','$http','Questions','$location', function($scope, $http, Questions, $location) {
		$scope.formData = {};

		$scope.createQuestion = function() {

			if ($scope.formData.question != undefined) {
				$location.path('/');
				Questions.create({
					Title : $scope.formData.question ,
					Subject : $scope.formData.subject
				}, function (err, todo) {

					if (err)
						res.send(err);
					else
					    $location.path('/');


				});

			}

		}

	}])

	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$http','Questions', function($scope, $http, Questions) {
		$scope.formData = {};
		$scope.loading = false;


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
