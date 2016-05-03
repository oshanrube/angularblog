angular.module('app.api_query', [])
    .factory("API", function () {
        var baseurl = "https://rube-angular-blog.firebaseio.com";
        return {
            getFirebaseRef: function () {
                return baseurl + "/data";
            },
            getFirebasePostRef: function () {
                return baseurl + "/data/posts";
            }
        }
    })
    .factory("User", function ($rootScope) {
        return {
            isLoggedIn: function () {
                return ($rootScope.localStorage.authData !== undefined && $rootScope.localStorage.authData.expires > Math.floor(Date.now() / 1000));
            }
        }
    });