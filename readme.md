# Angular Blog
---

simple bloggins software using angular and firebase.
the idea is to create a simple alternative to bloggin software like ghost but make it template friendly and host friendly.
so Angular blog is using angular and firebase to the backend. so the blog can run on a simple webserver. just need to run the html actually.

developers can add components as simple directive files

## installation

* clone the repo
* create an application in firebase (http://firebaseio.com)
* edit the `js/app_query.js` and update the base url with the firebase app url
* edit the index.html and update the `base` tag in the header to your host address
* import the rules for the application from `docs/firebase-rules.json`
* import the db structure from `docs/rube-angular-blog-export.json` and edit what ever is needed
* update the `admin` user with your gmail id
* host the index.html and assets folders to your hosting provider
* start blogging :D

## usage
use the login button on the bottom right corner to login 
![visitors in view](https://github.com/oshanrube/angularblog/blob/master/docs/screenshot.jpg?raw=true)

click on the elements to edit them, and they will be updated when clicked on elsewhere
* you can upload images by just simply drag and dropping the image to the text editor
![logged in view](https://github.com/oshanrube/angularblog/blob/master/docs/screenshot-1.jpg?raw=true)

view of the database structure
![db structure view](https://github.com/oshanrube/angularblog/blob/master/docs/screenshot-2.jpg?raw=true)

## TODO
* fix the two way databind to update the changes 
* add an interface to add new users and admins
* add comments section(something using facebook comments)
* create few more plugins
