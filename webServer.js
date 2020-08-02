"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */
var session = require("express-session");
var bodyParser = require("body-parser");
var multer = require("multer");
var processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);
var fs = require("fs");

var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

var async = require("async");

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require("./schema/user.js");
var Photo = require("./schema/photo.js");
var SchemaInfo = require("./schema/schemaInfo.js");

var express = require("express");
var app = express();

app.use(bodyParser.json());
app.use(
  session({
    secret: "badSecret",
    saveUninitialized: true,
    resave: true
  })
);

// XXX - Your submission should work without this line

mongoose.connect(
  "mongodb://localhost/cs142project6",
  { useMongoClient: true }
);

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.get("/", function(request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get("/test/:p1", function(request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params objects.
  console.log("/test called with param1 = ", request.params.p1);

  var param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
    SchemaInfo.find({}, function(err, info) {
      if (err) {
        // Query returned an error.  We pass it back to the browser with an Internal Service
        // Error (500) error code.
        console.error("Doing /user/info error:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object - This
        // is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an async
    // call to each collections. That is tricky to do so we use the async package
    // do the work.  We put the collections into array and use async.each to
    // do each .count() query.
    var collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo }
    ];
    async.each(
      collections,
      function(col, done_callback) {
        col.collection.count({}, function(err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function(err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          var obj = {};
          for (var i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400) status.
    response.status(400).send("Bad param " + param);
  }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get("/user/list", function(request, response) {
  if (request.session.user_id) {
    User.find({}, "first_name last_name", function(err, users) {
      if (err) {
        response.status(500).send(err.message);
        return;
      }
      response.status(200).send(JSON.parse(JSON.stringify(users)));
    });
  } else {
    response.status(401).send("Bad request");
    return;
  }
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get("/user/:id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Bad request");
    return;
  } else {
    var id = request.params.id;
    User.findById(
      { _id: id },
      "first_name last_name location description occupation",
      function(err, user) {
        if (err) {
          response.status(400).send("Not found");
          return;
        }
        response.status(200).send(JSON.parse(JSON.stringify(user)));
      }
    );
  }
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get("/photosOfUser/:id", function(request, response) {
  if (request.session.user_id) {
    var user_id = request.params.id;
    Photo.find(
      { user_id: user_id },
      "_id user_id comments file_name date_time numLikes",
      function(err, photos) {
        if (err) {
          response.status(400).send("Not found");
          return;
        }
        photos = JSON.parse(JSON.stringify(photos));
        async.each(
          photos,
          function(photo, callback) {
            delete photo._v;
            if (photo.comments || photo.comments.length > 0) {
              var temp = [];
              async.each(
                photo.comments,
                function(comment, callBackComment) {
                  User.findById(
                    { _id: comment.user_id },
                    "first_name last_name _id",
                    function(err, user) {
                      user = JSON.parse(JSON.stringify(user));
                      if (err) {
                        response.status(400).send("Not found");
                        callBackComment(err);
                        return;
                      }
                      comment.user = user;
                      delete comment.user_id;
                      temp.push(comment);
                      callBackComment();
                    }
                  );
                },
                function(err) {
                  if (err) {
                    console.log("Not found");
                    response.status(400).send("Not found");
                    callback(err);
                  } else {
                    photo.comments = temp;
                    console.log("All comments have been processed sucessfully");
                    callback();
                  }
                }
              );
            }
          },
          function(err) {
            if (err) {
              response.status(400).send("Not found");
            } else {
              console.log("All photos have been processed sucessfully");
              response.status(200).send(JSON.stringify(photos));
            }
          }
        );
      }
    );
  } else {
    response.status(401).send("Bad request");
    return;
  }
});

app.post("/admin/login", function(request, response) {
  var login = request.body.login_name;
  var password = request.body.password;
  User.findOne({ login_name: login, password: password }, function(err, user) {
    if (err || user == null) {
      response.status(400).send("User Not found");
      return;
    }
    request.session.user_id = user._id;
    request.session.save();
    return response.status(200).send(JSON.stringify(user));
  });
});

app.post("/user", function(request, response) {
  User.findOne({ login_name: request.body.login_name }, function(err, user) {
    if (user === null || err) {
      User.create(
        {
          first_name: request.body.first_name,
          last_name: request.body.last_name,
          login_name: request.body.login_name,
          password: request.body.password,
          location: request.body.location,
          description: request.body.description,
          occupation: request.body.occupation
        },
        (error, result) => {
          if (error) {
            response.status(400).send("User cannot be added");
            return;
          }
          console.log("result");
          console.log(result);
          return response.status(200).send(JSON.stringify(result));
        }
      );
    } else {
      return response.status(400).send("User already exists");
    }
  });
});

app.post("/admin/logout", function(request, response) {
  console.log(request.session.user_id);
  if (!request.session.user_id) {
    response.status(401).send("Bad request");
    return;
  }
  request.session.destroy();
  return response.status(200).send("logout");
});

app.post("/photos/new", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  }
  processFormBody(request, response, function(err) {
    if (err || !request.file) {
      response.status(400).send("No file uploaded");
      return;
    }
    let time = new Date().valueOf(); //returns the primitive time
    let filename = "U" + String(time) + request.file.originalname;

    fs.writeFile("./images/" + filename, request.file.buffer, function(err) {
      if (err) {
        response.status(400).send("Error in writing into directory");
        return;
      }
      let newPhoto = new Photo({
        file_name: filename,
        date_time: new Date(),
        user_id: request.session.user_id,
        comments: []
      });
      newPhoto.save(function(err) {
        if (err) {
          response.status(400).send("Error in saving photo to the database");
          return;
        }
      });
    });
    response.status(200).end("Photo successfully uploaded");
  });
});

app.get("/user/list", function(request, response) {
  if (request.session.user_id) {
    User.find({}, "first_name last_name", function(err, users) {
      if (err) {
        response.status(500).send(err.message);
        return;
      }
      response.status(200).send(JSON.parse(JSON.stringify(users)));
    });
  } else {
    response.status(401).send("Bad request");
    return;
  }
});

app.get("/favoritePics/:id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  } else {
    User.find({ _id: request.params.id }, function(err, user) {
      if (err) {
        response.status(400).send("Cannot find user");
      }
      return response.status(200).send(user[0].fav_photos);
    });
  }
});

app.get("/likePics/:id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  } else {
    User.find({ _id: request.params.id }, function(err, user) {
      if (err) {
        response.status(400).send("Cannot find user");
      }

      return response.status(200).send(user[0].liked_photos);
    });
  }
});

app.post("/disLikePhoto/:photo_id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  }
  let photo_id = request.params.photo_id;
  Photo.findOne({ _id: photo_id }, function(err, photo) {
    photo.numLikes--;

    photo.save(function(err) {
      if (err) {
        console.error(err);
      }
    });
    if (!photo) {
      console.log("Cannot find the photo");
      response.status(400).send("Cannot find the photo");
      return;
    }
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    User.find({ _id: request.session.user_id }, function(err, user) {
      if (err) {
        response.status(400).send("Cannot find user");
      }
      for (let i = 0; i < user[0].liked_photos.length; i++) {
        if (user[0].liked_photos[i]._id == request.body.id) {
          user[0].liked_photos.splice(i, 1);
        }
      }
      user[0].save(function(err) {
        if (err) {
          console.error(err);
        }
      });
    });

    return response.status(200).send("Photo has been unliked");
  });
});

app.post("/likePhoto/:photo_id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  }
  let photo_id = request.params.photo_id;
  Photo.findOne({ _id: photo_id }, function(err, photo) {
    if (photo.numLikes === undefined) {
      photo.numLikes = 0;
    }
    photo.numLikes++;
    photo.save(function(err) {
      if (err) {
        console.error(err);
      }
    });
    if (!photo) {
      console.log("Cannot find the photo");
      response.status(400).send("Cannot find the photo");
      return;
    }
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    User.find({ _id: request.session.user_id }, function(err, user) {
      if (err) {
        response.status(400).send("Cannot find user");
      }
      user[0].liked_photos = user[0].liked_photos.concat({
        file_name: photo.file_name,
        date_time: photo.date_time
      });
      user[0].save(function(err) {
        if (err) {
          console.error(err);
        }
      });
    });

    return response.status(200).send("Photo has been liked");
  });
});

app.post("/favPhoto/:photo_id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  }
  let photo_id = request.params.photo_id;
  Photo.findOne({ _id: photo_id }, function(err, photo) {
    if (!photo) {
      console.log("Cannot find the photo");
      response.status(400).send("Cannot find the photo");
      return;
    }
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    User.find({ _id: request.session.user_id }, function(err, user) {
      if (err) {
        response.status(400).send("Cannot find user");
      }
      user[0].fav_photos = user[0].fav_photos.concat({
        file_name: photo.file_name,
        date_time: photo.date_time
      });

      user[0].save(function(err) {
        if (err) {
          console.error(err);
        }
      });
    });
    return response.status(200).send("Photo favorited");
  });
});

app.post("/deleteFavPhoto/:photo_id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  } else {
    User.find({ _id: request.session.user_id }, function(err, user) {
      if (err) {
        response.status(400).send("Cannot find user");
      }
      for (let i = 0; i < user[0].fav_photos.length; i++) {
        if (user[0].fav_photos[i]._id == request.params.photo_id) {
          user[0].fav_photos.splice(i, 1);
        }
      }
      user[0].save(function(err) {
        if (err) {
          console.error(err);
        }
      });
      return response.status(200).send(user[0].fav_photos);
    });
  }
});

app.post("/commentsOfPhoto/:photo_id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  }
  let comment = request.body.comment;
  let photo_id = request.params.photo_id;
  if (!comment.length) {
    console.error("Blank comment");
    response.status(400).send("Blank comment");
    return;
  }
  Photo.findOne({ _id: photo_id }, function(err, photo) {
    if (!photo) {
      console.log("Cannot find the photo");
      response.status(400).send("Cannot find the photo");
      return;
    }
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    photo.comments = photo.comments.concat({
      comment: comment,
      user_id: request.session.user_id,
      date_time: new Date()
    });
    photo.save(function(err) {
      if (err) {
        console.error(err);
      }
    });
    return response.status(200).send("Comment Added");
  });
});

var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
