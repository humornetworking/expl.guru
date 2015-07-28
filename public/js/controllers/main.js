angular.module('todoController', ['ngRoute','ngStorage'])

	.config(function( $routeProvider, $httpProvider) {
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
			})
			.when('/login', {
				templateUrl : 'partials/login.html',
				controller  : 'loginController'
			});

		$httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
			return {
				'request': function (config) {
					config.headers = config.headers || {};
					if ($localStorage.token) {
						config.headers.Authorization = 'Bearer ' + $localStorage.token;
					} else {
						$location.path('/login'); //Si no esta autorizado lo mando al login
					}
					return config;
				}
			};
		}]);




	})

	.controller('explainController', function($scope, $routeParams,Questions, Answers, $location) {

		$scope.formData = {};
		var idQuestion = $routeParams.param;

		Questions.getById({
			_id : idQuestion
		}).success(function(data) {

			    $scope.formData.id = data[0]._id;
				$scope.formData.question = data[0].Title;
				$scope.formData.subject = data[0].Subject;

			});

		$scope.answerQuestion = function() {

			if ($scope.formData.answer != undefined) {

				Answers.create({
					Question : {_id : $scope.formData.id,
						         Title : $scope.formData.question,
						         Subject : $scope.formData.subject} ,
					Answer : $scope.formData.answer
				}).success(function(){
					$location.path('/');
				});

			}

		}


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

	.controller('loginController', function($scope, $localStorage, $location, Util) {


		$scope.facebookLogin = function() {



			OAuth.initialize('P0M9nmp8JTxEJCGcW9Sb3x83_Og');
			OAuth.popup('facebook')
				.done(function(result) {

					result.get('/me')
						.done(function (response) {

							Util.signin({
								name  : response.name ,
								type : "Facebook"
							}).success(function(data){
								$localStorage.token = data.token;
								$location.path('/');
							});


						})

				})
				.fail(function (err) {
					//handle error with err
				});
		};


	})


	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$http','$routeParams','Questions', function($scope, $http, $routeParams, Questions) {
		$scope.formData = {};
		$scope.loading = false;

		Questions.getTopQuestions()
			.success(function(data) {
				$scope.questions = data;
				$scope.loading = false;
			});


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



		$scope.searchQuestionByText = function() {

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.searchText != undefined) {
				//$scope.loading = true;

				Questions.getByText({
					text : $scope.formData.searchText
				})
					.success(function(data) {
						$scope.questions = data;
						$scope.loading = false;
					});
			}
		};



		$scope.explain = function (id) {
			alert("Hola Mundo "+ id);
		};



	}]);
