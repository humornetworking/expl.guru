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
				templateUrl : 'partials/answer.html',
				controller  : 'explainController'
			})
			.when('/question', {
				templateUrl : 'partials/question.html',
				controller  : 'questionController'
			});


	})

	.controller('explainController', function($scope, $routeParams,Questions) {

		$scope.formData = {};
		var idQuestion = $routeParams.param;

		Questions.getById({
			_id : idQuestion
		}).success(function(data) {
			    $scope.formData.json = data;
				$scope.formData.question = data[0].Title;
				$scope.formData.subject = data[0].Subject;

			});


	})
	.controller('questionController', ['$scope','$http','Questions','$location', function($scope, $http, Questions, $location) {
		$scope.formData = {};

		$scope.createQuestion = function() {

			if ($scope.formData.question != undefined) {

				Questions.create({
					Title : $scope.formData.question ,
					Subject : $scope.formData.subject
				}).success(function(){
					$location.path('/');
				});

			}

		}



	}])

	.controller('answerController', function($scope, $http, $location, Answers) {

		$scope.answerQuestion= function() {

			if ($scope.formData.answer != undefined) {

				Answers.create({
					Question : $scope.formData.json ,
					Answer : $scope.formData.answer
				}).success(function(){
					$location.path('/');
				});

			}

		}



	})

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
