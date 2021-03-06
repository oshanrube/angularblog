angular.module('app.directives', [])
    .directive('navbar', function () {
        return {
            restrict: 'E',
            templateUrl: 'assets/templates/navbar.html',
            link: function () {
                //loadSearchBox();
                //loadDropDownMenu();
            }
        };
    })
    .directive('blogPost', function ($timeout, $rootScope, $firebaseObject, API, User) {
        return {
            restrict: 'E',
            templateUrl: 'assets/templates/blog-post.html'
        };
    })
    .directive('sidebar', function () {
        return {
            restrict: 'E',
            templateUrl: 'assets/templates/sidebar.html'
        };
    })
    .directive('footer', function () {
        return {
            restrict: 'E',
            templateUrl: 'assets/templates/footer.html'
        };
    })
    .directive('modal', function () {
        return {
            restrict: 'E',
            templateUrl: 'assets/templates/modal.html'
        };
    })
    .directive('markdownToHtml', function () {
        return {
            restrict: 'A',
            scope: {
                model: '=markdownToHtml'
            },
            template: '<div ng-bind-html="trustedHtml"></div>',
            link: function (scope, element, attrs) {
                scope.$watch('model', function (markdown) {
                    var utils = {
                        reverse: function (str) {
                            return str.split("").reverse().join("");
                        }
                    };
                    var html = markdown;
                    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gm, function (match, p1, p2) {
                        return "<a href='" + p2 + "'>" + p1.replace(/\n/g, '') + "</a>";
                    });

                    // This may seem crazy, but because JS doesn't have a look behind,
                    // we reverse the string to regex out the italic items (and bold)
                    // and look for something that doesn't start (or end in the reversed strings case)
                    // with a slash.
                    html = utils.reverse(
                        utils.reverse(html)
                            .replace(/_(?!\\)((_\\|[^_])*)_(?=$|[^\\])/gm, function (match, p1) {
                                return ">i/<" + p1.replace(/\n/g, '').replace(/[\s]+$/, '') + ">i<";
                            })
                            .replace(/\*\*(?!\\)((\*\*\\|[^\*\*])*)\*\*(?=$|[^\\])/gm, function (match, p1) {
                                return ">b/<" + p1.replace(/\n/g, '').replace(/[\s]+$/, '') + ">b<";
                            })
                    );

                    html = html.replace(/^\> (.+)$/mg, "$1");

                    html = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
                        .replace(/\n/g, "<br>")
                        .replace(/\*\*/, "")
                        .replace(/__/, "");  // Cleanup any markdown characters left

                    // Replace escaped
                    html = html.replace(/\\\*/g, "*")
                        .replace(/\\\[/g, "[")
                        .replace(/\\\]/g, "]")
                        .replace(/\\\_/g, "_")
                        .replace(/\\\(/g, "(")
                        .replace(/\\\)/g, ")")
                        .replace(/\\\-/g, "-");

                    scope.trustedHtml = html;
                });
            }
        };
    })
    .directive('materialDatepicker', function (API, User, $firebaseObject) {
        return {
            restrict: 'A',
            scope: {
                model: '=materialDatepicker',
                postid: '='
            },
            template: '<div ng-bind-html="trustedHtml"></div>',
            link: function (scope, element, attrs) {

                if (User.isLoggedIn()) {
                    var onSetValue = function (datetime) {
                        scope.trustedHtml = datetime;
                        //push the changes to firebase
                        //TODO fix the two way binding
                        var postsRef = new Firebase(API.getFirebasePostRef() + "/" + scope.postid);
                        var post = $firebaseObject(postsRef);
                        post.$loaded().then(function () {
                            post.date = datetime;
                            post.$save();
                        });
                    };

                    $('.blog-post-date').bootstrapMaterialDatePicker(
                        {
                            format: 'dddd DD MMMM YYYY',
                            onSetValue: onSetValue,
                            time: false
                        }
                    );
                    $('.blog-post-date').addClass('editable');
                }
                if (scope.model !== undefined) {
                    scope.trustedHtml = scope.model.date;
                }
            }
        }
    })
    .directive('materialCategories', function (API, User, $firebaseObject) {
        return {
            restrict: 'E',
            scope: {
                categories: '=',
                editmode: '=',
                postid: '='
            },
            templateUrl: 'assets/templates/material-categories.html'
        }
    })
    .controller('materialCategories', function ($scope, $firebaseObject, API) {
        this.updateCategory = function ($event, $index) {
            $scope.$parent.categories[$index] = $($event.target).text();
            //push the changes to firebase
            //TODO fix the two way binding
            var postsRef = new Firebase(API.getFirebasePostRef() + "/" + $scope.$parent.postid);
            var post = $firebaseObject(postsRef);
            post.$loaded().then(function () {
                post.categories = $scope.$parent.categories
                post.$save();
            });
        };
        this.isEditMode = function () {
            return $scope.$parent.editmode;
        };
        this.getCategories = function () {
            return $scope.$parent.categories;
        };
        this.addCategory = function () {
            //push to a object
            $scope.$parent.categories[$scope.$parent.categories.length] = "New Category";
        };
    })
    .directive('materialTitle', function (API, User, $firebaseObject) {
        return {
            restrict: 'A',
            scope: {
                model: '=materialTitle',
                postid: '='
            },
            template: '<div ng-bind-html="trustedHtml"></div>',
            link: function (scope, element, attrs) {
                if (User.isLoggedIn()) {
                    $(element).click(function () {
                        $(this).attr('contenteditable', true);
                        $(this).blur(function () {
                            scope.model.title = $(this).text();
                            scope.trustedHtml = scope.model.title;
                            $(this).attr('contenteditable', false);
                            //push the changes to firebase
                            //TODO fix the two way binding
                            var postsRef = new Firebase(API.getFirebasePostRef() + "/" + scope.postid);
                            var post = $firebaseObject(postsRef);
                            post.$loaded().then(function () {
                                post.title = scope.model.title;
                                post.alias = encodeURIComponent(scope.model.title);
                                post.$save();
                            });
                        });
                    });
                }
                if (scope.model !== undefined) {
                    scope.trustedHtml = scope.model.title;
                }
            }
        }
    })
    .directive('materialField', function (API, User, $firebaseObject, $rootScope) {
        return {
            restrict: 'A',
            scope: {
                model: '=materialField'
            },
            template: '<div ng-bind-html="trustedHtml"></div>',
            link: function (scope, element, attrs) {

                if (User.isLoggedIn()) {
                    $(element).click(function () {
                        $(this).attr('contenteditable', true);
                        $(this).blur(function () {
                            blocks = $rootScope.getData('blocks');
                            blocks[scope.model] = $(this).text();
                            scope.trustedHtml = blocks[scope.model];
                            $(this).attr('contenteditable', false);
                            //push the changes to firebase
                            //TODO fix the two way binding
                            var postsRef = new Firebase(API.getFirebaseRef() + "/blocks");
                            var blocks = $firebaseObject(postsRef);
                            blocks.$loaded().then(function () {
                                blocks[scope.model] = scope.trustedHtml;
                                blocks.$save();
                            });
                        });
                    });
                }

                $rootScope.syncObject.$loaded().then(function () {
                    blocks = $rootScope.getData('blocks');
                    scope.trustedHtml = blocks[scope.model];
                });

            }
        }
    })
//.directive('a', function (User) {
//    return {
//        restrict: 'E',
//        link: function (scope, elem, attrs) {
//
//            if (User.isLoggedIn()) {
//                elem.on('click', function (e) {
//
//                    var afterLoad = function () {
//                        $('#modal input#url').val($(elem).attr('href'));
//                        if ($(elem).find('span').length > 0) {
//                            $('#modal input#label').val($(elem).find('span').text());
//                        } else {
//                            $('#modal input#label').val($(elem).text());
//                        }
//                        $('#modal button#saveBtn').click(function () {
//                            //save button
//                            $(elem).attr('href', $('#modal input#url').val());
//
//                            if ($(elem).find('span').length > 0) {
//                                $(elem).find('span').text($('#modal input#label').val());
//                            } else {
//                                $(elem).text($('#modal input#label').val());
//                            }
//
//                            //close
//                            $('#modal button#closeBtn').trigger('click');
//                        });
//                    };
//                    //open the dialog
//                    Modal.open({
//                        modalId: 'modal',
//                        onLoad: afterLoad
//                    });
//
//
//                    e.preventDefault();
//                });
//            }
//        }
//    };
//});