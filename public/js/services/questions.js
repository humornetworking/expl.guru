angular.module('questionService', [])

    // super simple service
    // each function returns a promise object
    .factory('Questions', ['$http',function($http) {
        return {
            get : function() {
                return $http.get('/api/questions');
            },
            create : function(todoData) {
                return $http.post('/api/questions', todoData);
            },
            delete : function(id) {
                return $http.delete('/api/questions/' + id);
            }
        }
    }]);