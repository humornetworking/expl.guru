angular.module('questionService', [])

    // super simple service
    // each function returns a promise object
    .factory('Questions', ['$http',function($http) {
        return {
            get : function() {
                return $http.get('/api/questions');
            },
            create : function(questionData) {
                return $http.post('/api/questions', questionData);
            },
            delete : function(id) {
                return $http.delete('/api/questions/' + id);
            }
        }
    }]);