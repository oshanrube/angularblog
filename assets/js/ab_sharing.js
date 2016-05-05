angular.module('ab.sharing', [])
    .directive('abSharing', function (API, User, $firebaseObject, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'assets/templates/ab-sharing.html'
        }
    })
    .controller('abSharingController', function ($scope, $state) {

        this.icons = {
            'fb': {
                icon: 'zmdi-facebook-box',
                name: 'Facebook',
                link: 'https://www.facebook.com/sharer.php?u='
            },
            'google': {
                icon: 'zmdi-google-plus-box',
                name: 'Google',
                link: 'https://plus.google.com/share?url='
            },
            'twitter': {
                icon: 'zmdi-twitter-box',
                name: 'Twitter',
                link: 'http://twitter.com/share?url='
            },
            'pinterest': {
                icon: 'zmdi-pinterest-box',
                name: 'Pinterest',
                link: 'https://pinterest.com/pin/create/bookmarklet/?url='
            }
        };

        this.openLink = function (icon, alias) {
            //open
            var url = $state.href('post', {alias: alias}, {absolute: true});
            window.open(icon.link + encodeURIComponent(url));
        };

        this.getIcons = function () {
            return this.icons;
        };
    });