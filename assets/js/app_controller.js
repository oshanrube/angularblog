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
        this.search_categories = [];

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
            return ($scope.localStorage.authData !== undefined && $scope.localStorage.authData.expires > Math.floor(Date.now() / 1000) && $scope.isAdmin());
        };

        this.isHomePage = function () {
            return ($state.current.name == 'home');
        };
        this.getSocial = function (social) {
            return $scope.getData('social', social);
        };

        this.getFilterKey = function (category) {
            //check for duplicates
            for (key in this.search_categories) {
                if (this.search_categories[key] == category.name) {
                    return key;
                }
            }
            return false;
        };
        this.isInFilter = function (category) {
            return (this.getFilterKey(category) !== false);
        };

        this.toggleFromCategoryFilter = function (category) {
            if (!this.isInFilter(category)) {
                this.search_categories.push(category.name);
            } else {
                this.search_categories.splice(this.getFilterKey(category), 1);
            }
        };

        this.getSearches = function () {
            return {
                query: this.search_query,
                categories: this.search_categories
            }
        }
    })
    .controller('PostsController', function ($scope, $firebaseArray, API, User) {

        var isPublished = function (post) {
            return ((post.state == "published") || (User.isLoggedIn() && post.state == 'draft'));
        };


        this.getPosts = function (searches) {
            var posts = $scope.getData('posts');

            var filterByCategory = function (post) {
                //check if filters are there
                if (searches.categories.length != 0) {
                    for (cat_key in searches.categories) {
                        var search_cat = searches.categories[cat_key];
                        var found = false;

                        for (post_key in post.categories) {
                            var post_cat = post.categories[post_key];
                            if (search_cat == post_cat) {
                                found = true;
                            }
                        }

                        if (!found) {
                            return false;
                        }
                    }
                }
                return true;
            };

            var filtered_posts = {};
            for (key in posts) {
                var post = posts[key];
                var re = new RegExp(searches.query, 'i');

                if (isPublished(post) && filterByCategory(post)) {
                    if (post.title.match(re)) {
                        filtered_posts[key] = posts[key];
                    }
                }
            }

            return filtered_posts;
        };

        this.addNewPost = function () {

            var post = {
                alias: 'new-title',
                state: 'draft',
                date: moment().format('dddd DD MMMM YYYY'),
                categories: ['cat1'],
                title: "New Title",
                intro: "this is sample intro",
                content: "this is sample content"
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
    .controller('PostController', function ($scope, $stateParams, API, $firebaseObject, $timeout) {


        this.post;
        this.postid;
        var introHTML;
        var contentHTML;
        this.editmode = false;
        this.sharingBoxVisible = false;

        var resetHTML = function () {
            introHTML = undefined;
            contentHTML = undefined;
        };
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

        this.isSingleView = function () {
            return ($stateParams.alias !== undefined);
        };

        this.loadPost = function () {
            var posts = $scope.getData('posts');
            for (key in posts) {
                if ($scope.blogpost !== undefined && posts[key].alias == $scope.blogpost.alias) {
                    this.post = posts[key];
                    this.postid = key;
                    this.parseMarkdown();
                }
                else if (posts[key].alias == $stateParams.alias) {
                    this.post = posts[key];
                    this.postid = key;
                    this.parseMarkdown();
                }
            }

        };

        this.parseMarkdown = function () {
            var re = /img src="(imgs\/([a-zA-Z0-9]+))"/g;

            if (this.post.intro && introHTML === undefined) {
                var markdown = marked(this.post.intro);
                //replace the imgs
                while (match = re.exec(markdown)) {
                    var image = $scope.getData('posts', this.postid, 'images', match[2]);
                    if (image !== undefined) {
                        markdown = markdown.replace(match[1], image);
                    }
                }
                introHTML = markdown;
            }
            if (this.post.content && contentHTML === undefined) {
                var markdown = marked(this.post.content);
                //replace the imgs
                while (match = re.exec(markdown)) {
                    var image = $scope.getData('posts', this.postid, 'images', match[2]);
                    if (image !== undefined) {
                        markdown = markdown.replace(match[1], image);
                    }
                }
                contentHTML = markdown;
            }
        };

        this.toggleSharingBox = function () {
            this.sharingBoxVisible = (!this.sharingBoxVisible);
        };

        this.isSharingBoxVisible = function () {
            return (this.sharingBoxVisible);
        };

        this.getFBref = function () {
            return API.getFirebasePostRef() + "/" + this.postid;
        };
        this.getIntroHTML = function () {
            this.loadPost();
            return introHTML;
        };
        this.getContentHTML = function () {
            this.loadPost();
            return contentHTML;
        };

        //on init
        this.loadPost();

        this.isEditMode = function () {
            return this.editmode;
        };
        this.edit = function ($event) {
            this.editmode = true;
            //load the editors
            var element = $($event.target).parent();
            if (!element.data('editorLoaded')) {
                element.data('editorLoaded', true);
                var parseMarkdown = function (postid, content, targer) {
                    var markdown = marked(content);
                    //replace the imgs
                    var re = /img src="(imgs\/([a-zA-Z0-9]+))"/g;
                    while (match = re.exec(markdown)) {
                        var image = $scope.getData('posts', postid, 'images', match[2]);
                        if (image !== undefined) {
                            markdown = markdown.replace(match[1], image);
                        }
                    }
                    targer.html(markdown);
                };
                Dropzone.prototype.submitRequest = function (xhr, formData, files) {
                    var form = $(this.element);
                    if ($(this.element).data('fbref') == null) {
                        form = $(this.element).parents('form');
                    }

                    var pace_element = $('div.pace').clone();
                    pace_element.removeClass('pace-inactive');
                    pace_element.addClass('pace-active');
                    form.append(pace_element);
                    var target = form.data('target');
                    var file = files[0];
                    // Handle one upload at a time
                    if (/image/.test(file.type)) {
                        //upload
                        var reader = new FileReader();
                        reader.onload = (function (theFile) {
                            return function (e) {
                                var filePayload = e.target.result;
                                // Generate a location that can't be guessed using the file's contents and a random number
                                var hash = CryptoJS.SHA256(Math.random() + CryptoJS.SHA256(filePayload));

                                var fbref = form.data('fbref') + "/images" + '/' + hash;
                                if (target == 'cover') {
                                    fbref = form.data('fbref') + "/image";
                                }
                                var f = new Firebase(fbref);
                                // Set the file payload to Firebase and register an onComplete handler to stop the spinner and show the preview
                                f.set(filePayload, function () {
                                    form.find('div.pace').remove();
                                    var postid = form.data('postid');
                                    var post = $scope.getData('posts', postid);

                                    if (target == 'images') {
                                        //append to the text
                                        var title = 'enter image title here';
                                        var description = 'enter image description here';
                                        textareatxt = form.find('textarea.md-input').val();
                                        textareatxt += '![' + description + '](imgs/' + hash + ' "' + title + '")';
                                        form.find('textarea.md-input').val(textareatxt);
                                        form.find('textarea.md-input').trigger('change');
                                        post.images[hash] = filePayload;
                                    } else {
                                        post.image = filePayload;
                                        $(form).parents('blog-post').find('img.coverimage').attr('src', filePayload);
                                    }
                                });
                            };
                        })(file);
                        reader.readAsDataURL(file);
                    }
                };
                $(element).find('textarea[data-provide="markdown"]').markdown({
                    dropZoneOptions: {url: "/file/post", previewsContainer: false},
                    onChange: function (e) {
                        if (e.isDirty()) {
                            var form = $(e.$textarea).parents('form');
                            if (!form.data('pending-upload')) {
                                form.data('pending-upload', true);
                                $timeout(function () {
                                    form.data('pending-upload', false);
                                    var postid = form.data('postid');
                                    var localPost = $scope.getData('posts', postid);
                                    //push the changes to firebase
                                    //TODO fix the two way binding
                                    var postsRef = new Firebase(API.getFirebasePostRef() + "/" + postid);
                                    var post = $firebaseObject(postsRef);
                                    post.$loaded().then(function () {
                                        if (form.attr('id') == "introEditor") {
                                            post.intro = e.getContent();
                                            localPost.intro = e.getContent();
                                        } else if (form.attr('id') == "contentEditor") {
                                            post.content = e.getContent();
                                            localPost.content = e.getContent();
                                        }
                                        post.$save();
                                        resetHTML();
                                    });
                                    parseMarkdown(postid, e.getContent(), $(e.$textarea).parent().find('#md-preview'));
                                }, 3000);
                            }
                        }
                    }
                });

                //override the image drop
                $(element).find('form#coverimage-dropzone').dropzone({previewsContainer: false});
                //parse on load
                parseMarkdown(this.postid, this.post.intro, $(element).find('form#introEditor #md-preview'));
                parseMarkdown(this.postid, this.post.content, $(element).find('form#contentEditor #md-preview'));
            }
        };
        this.save = function () {
            this.editmode = false;
        };
        this.delete = function () {
            //push the changes to firebase
            //TODO fix the two way binding
            var postsRef = new Firebase(API.getFirebasePostRef() + "/" + this.postid);
            var post = $firebaseObject(postsRef);
            post.$loaded().then(function () {
                post.state = 'deleted';
                post.$save();
            });

        };
        this.isPostPublished = function () {
            return (this.post !== undefined && this.post.state == "published");
        };
        this.publish = function () {
            var pst = $scope.getData('posts', this.postid);
            pst.state = 'published';
            ////push the changes to firebase
            ////TODO fix the two way binding
            //var postsRef = new Firebase(API.getFirebasePostRef() + "/" + this.postid);
            //var post = $firebaseObject(postsRef);
            //post.$loaded().then(function () {
            //    post.state = 'published';
            //    post.$save();
            //    var pst = $scope.getData('posts', post.$id);
            //    pst.state = 'published';
            //});
        };
        this.unPublish = function () {
            var pst = $scope.getData('posts', this.postid);
            pst.state = 'draft';
            ////push the changes to firebase
            ////TODO fix the two way binding
            //var postsRef = new Firebase(API.getFirebasePostRef() + "/" + this.postid);
            //var post = $firebaseObject(postsRef);
            //post.$loaded().then(function () {
            //    post.state = 'draft';
            //    post.$save();
            //pst.state = 'draft';
            //});
        };
    });