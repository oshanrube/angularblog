angular.module('ab.archives', [])
    .directive('abArchives', function (API, User, $firebaseObject, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'assets/templates/ab-archives.html'
        }
    })
    .controller('abArchivesController', function ($scope) {
        var months = new Array();
        var posts;

        this.getMonths = function () {
            if ($scope.getData('posts') !== undefined && posts !== $scope.getData('posts')) {
                jQuery.each($scope.getData('posts'), function (key, post) {
                    var monthlabel = moment(post.date, 'dddd DD MMMM YYYY - HH:mm').format('MMMM YYYY');
                    var catarrkey;
                    for (key in months) {
                        if (monthlabel === months[key].label) {
                            catarrkey = key;
                        }
                    }

                    if (catarrkey == undefined) {
                        months[months.length] = {
                            label: monthlabel
                        };
                    }
                });
                posts = $scope.getData('posts');
            }
            return months;
        };
    });
