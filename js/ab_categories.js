angular.module('ab.categories', [])
    .directive('abCategories', function (API, User, $firebaseObject, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'templates/ab-categories.html'
        }
    })
    .controller('abCategoriesController', function ($scope) {
        var categories = new Array();
        var posts;

        this.getCategories = function () {
            if ($scope.getData('posts') !== undefined && posts !== $scope.getData('posts')) {
                jQuery.each($scope.getData('posts'), function (key, post) {
                    for (catkey in post.categories) {
                        var category = post.categories[catkey];

                        var catarrkey;
                        for (key in categories) {
                            if (category === categories[key].name) {
                                catarrkey = key;
                            }
                        }

                        if (catarrkey == undefined) {
                            categories[categories.length] = {name: category, count: 1};
                        } else {
                            categories[catarrkey].count++;
                        }

                    }
                });
                posts = $scope.getData('posts');
            }
            return categories;
        };
    });
