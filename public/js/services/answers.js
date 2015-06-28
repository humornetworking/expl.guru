angular.module('answerService', [])

    // super simple service
    // each function returns a promise object
    .factory('Answers', ['$http',function($http) {
        return {

            create : function(answerData) {
                return $http.post('/api/answers', answerData);
            }
        }
    }]);
