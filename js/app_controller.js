angular.module('app.controllers', [])
    .controller('HeaderController', function ($scope) {
        this.getPageTitle = function () {
            return $scope.getData('site', 'title');
        };
    })
    .controller('NavbarController', function ($scope) {
        this.getTitle = function () {
            return $scope.getData('site', 'title');
        };
        this.getNavbarItems = function () {
            return $scope.getData('navbar');
        };
        this.getLink = function (item) {
            return (item.url !== undefined ? item.url : '');
        };
        this.getLabel = function (item) {
            return (item.label !== undefined ? item.label : '');
        };
        this.hasChildren = function (item) {
            return (item.children !== undefined);
        };
        this.getChildren = function (item) {
            return item.children;
        };
        this.click = function (ev) {
            alert('asd');
            ev.preventDefault();
        };
    })
    .controller('PageController', function ($scope, $state) {
        this.search_query = '';

        this.login = function () {
            if (!this.isLoggedIn()) {
                $scope.FirebaseRef.authWithOAuthPopup("google", function (error, authData) {
                    if (error) {
                        console.log("Login Failed!", error);
                    } else {
                        $scope.localStorage.authData = authData;
                    }
                });
            }
            else {
                $scope.FirebaseRef.unauth();
                delete $scope.localStorage.authData;
            }
        };

        this.isLoggedIn = function () {
            return ($scope.localStorage.authData !== undefined && $scope.localStorage.authData.expires > Math.floor(Date.now() / 1000));
        };

        this.isHomePage = function () {
            return ($state.current.name == 'home');
        };
        this.getSocial = function (social) {
            return $scope.getData('social', social);
        };
    })
    .controller('PostsController', function ($scope, $firebaseArray, API) {
        this.getPosts = function (search_query) {
            var posts = $scope.getData('posts');

            var filtered_posts = {};
            for (key in posts) {
                var post = posts[key];
                var re = new RegExp(search_query, 'i');
                if (post.title.match(re)) {
                    filtered_posts[key] = posts[key];
                }
            }
            return filtered_posts;
        };
        this.addNewPost = function () {

            var post = {
                alias: 'new-title',
                state: 'draft',
                date: moment().format('dddd DD MMMM YYYY - HH:mm'),
                categories: ['cat1'],
                title: "New Title",
                json: {
                    "data": [{"type": "heading", "data": {"text": "Post header"}}, {
                        "type": "text",
                        "data": {"text": "This is the post content**\n"}
                    }]
                }
            };

            var postsRef = new Firebase(API.getFirebasePostRef());
            var posts = $firebaseArray(postsRef);
            posts.$add(post);
        };
        this.getPostRef = function (postid) {
            return API.getFirebasePostRef() + "/" + postid;
        };
        this.hasMore = function () {
            return false;
        };
        this.getPostContent = function (block) {
            //generate content
            return block.data.text;
        };
        this.isPostHeader = function (block) {
            return block.type == "heading";
        };
        this.isPostContent = function (block) {
            return block.type == "text";
        };
        this.isPostList = function (block) {
            return block.type == "list";
        };
        this.updatePostDatetime = function (e) {
            console.log(e);
        };
    })
    .controller('ModalController', function () {
        this.url = '';
        this.label = '';
    })
    .controller('PostController', function ($scope, $stateParams, API) {


        this.post;
        this.postid;
        this.sharingBoxVisible = false;
        this.getData = function (param) {
            if (this.post === undefined) {
                this.loadPost();
            }

            if (this.post != undefined) {
                return this.post[param];
            }
        };

        this.isReadmorePage = function () {
            return ($stateParams.alias != undefined);
        };


        this.loadPost = function () {
            var posts = $scope.getData('posts');
            for (key in posts) {
                if ($scope.blogpost !== undefined && posts[key].alias == $scope.blogpost.alias) {
                    this.post = posts[key];
                    this.postid = key;
                }
                else if (posts[key].alias == $stateParams.alias) {
                    this.post = posts[key];
                    this.postid = key;
                }
            }
        };
        this.loadPost();

        this.toggleSharingBox = function () {
            this.sharingBoxVisible = (!this.sharingBoxVisible);
        };

        this.isSharingBoxVisible = function () {
            return (this.sharingBoxVisible);
        };

        this.getFBref = function () {
            return API.getFirebasePostRef() + "/" + this.postid;
        };
    });