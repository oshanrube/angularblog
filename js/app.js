(function () {
    var app = angular.module("angularBlog",
        [
            'app.controllers', 'app.directives', 'app.api_query',//base angular
            'ui.router', 'ngSanitize', "firebase", 'ngStorage', 'wiz.markdown', 'ngMaterial', //dependencies
            'ab.categories', 'ab.archives', 'ab.sharing' //plugins
        ])
        .run(function ($rootScope, $firebaseObject, $localStorage, API) {

            $rootScope.localStorage = $localStorage;
            $rootScope.FirebaseRef = new Firebase(API.getFirebaseRef());
            // download the data into a local object
            $rootScope.syncObject = $firebaseObject($rootScope.FirebaseRef);
            // synchronize the object with a three-way data binding
            // click on `index.html` above to see it used in the DOM!
            $rootScope.syncObject.$bindTo($rootScope, "data");
            //.then(function () {
            //    console.log($rootScope.data);
            //});
            //$rootScope.syncObject.$watch(function () {
            //    var d = new Date();
            //    console.log("data changed:", d.toUTCString());
            //});

            $rootScope.getData = function () {
                if ($rootScope.data !== undefined) {
                    var data = $rootScope.data;
                    for (var x = 0; x < arguments.length; x++) {
                        if (data[arguments[x]] === undefined) {
                            return undefined;
                        } else {
                            data = data[arguments[x]];
                        }
                    }
                    return data;
                }
            };

        }).config(function ($stateProvider, $urlRouterProvider) {
            // Now set up the states
            $stateProvider
                .state('home', {
                    url: "/",
                    templateUrl: "partials/home.html"
                })
                .state('post', {
                    url: "/post/:alias",
                    templateUrl: "partials/post.html"
                });
            $urlRouterProvider.otherwise("/");
        });


})();