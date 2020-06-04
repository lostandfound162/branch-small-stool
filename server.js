/* NOTES:

  TODO:

  - input validation
  
    Database creation and input into the database 
    - (step 9) send images to ecs162.org and delete them from images folder

  DONE:
  - Login with ucd email Do step 8 in step-step 
  - send error message to non uc davis logins from requireUser()
    - res.redirect('/?email=notUCD');

  - database filtered query
    - date and time filtering
    - location filtering

  - Add google maps
      - CHANGE HOW LOCATION IS STORED ON THE CLIENT SIDE
      - TIME IS OFF BETWEEN SAVING IT ON THE SCREEN AND PULLING IT

*/

const express = require('express');
const bodyParser = require('body-parser');
const assets = require('./assets');
const multer = require('multer');
const FormData = require("form-data");
const sqlite3 = require('sqlite3');  // we'll need this later
const request = require('request');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Some modules related to cookies, which indicate that the user
// is logged in
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');


//====================== BUILDING DATABASE ========================================================

// Interface for DB
const LostAndFoundDB = new sqlite3.Database('temp006.db');

// Actual table creation; only runs if "lostAndFound.db" is not found or empty
let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name='lostTable' ";
LostAndFoundDB.get(cmd, function (err, val) {
    console.log(err, val);
    if (val == undefined) {
        console.log("No database file - creating one");
        createLostAndFoundDB();
    } else {
        console.log("Database file found");
    }
});

function createLostAndFoundDB() {
    // explicitly declaring the rowIdNum protects rowids from changing if the 
    // table is compacted; not an issue here, but good practice
    const cmd = 'CREATE TABLE lostTable ( id INTEGER PRIMARY KEY UNIQUE, itemType TEXT, title TEXT, category TEXT, description TEXT, imageURL TEXT, date INT, location TEXT)';
    LostAndFoundDB.run(cmd, function(err, val) {
      if (err) {
        console.log("Database creation failure",err.message);
      } else {
        console.log("Created database");
      }
    });
  }



//=================================== IMAGE HANDLER ===================================

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
// let upload = multer({dest: __dirname+"/assets"});
let upload = multer({ storage: storage });



//====================== LOGINS HANDLING ========================================================
// Setup passport, passing it information about what we want to do
passport.use(new GoogleStrategy(
  // object containing data to be sent to Google to kick off the login process
  // the process.env values come from the key.env file of your app
  // They won't be found unless you have put in a client ID and secret for 
  // the project you set up at Google
  {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'https://branch-small-stool.glitch.me/auth/accepted',
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo', // where to go for info
  scope: ['email','profile']  // the information we will ask for from Google
},
  // function to call to once login is accomplished, to get info about user from Google;
  // it is defined down below.
  gotProfile));



//====================== SERVER PIPELINE ========================================================

// Start setting up the Server pipeline
const app = express();
console.log("setting up pipeline")

// take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({extended: true}));
// puts cookies into req.cookies
app.use(cookieParser());

// pipeline stage that echos the url and shows the cookies, for debugging.
app.use("/", printIncomingRequest);

// Now some stages that decrypt and use cookies

// express handles decryption of cooikes, storage of data about the session, 
// and deletes cookies when they expire
app.use(expressSession(
  { 
    secret:'bananaBread',  // a random string used for encryption of cookies
    maxAge: 6 * 60 * 60 * 1000, // Cookie time out - six hours in milliseconds
    // setting these to default values to prevent warning messages
    resave: true,
    saveUninitialized: false,
    // make a named session cookie; makes one called "connect.sid" as well
    name: "ecs162-session-cookie"
  }));

// Initializes request object for further handling by passport
app.use(passport.initialize()); 

// If there is a valid cookie, will call passport.deserializeUser()
// which is defined below.  We can use this to get user data out of
// a user database table, if we make one.
// Does nothing if there is no cookie
app.use(passport.session()); 

// currently not used
// using this route, we can clear the cookie and close the session
app.get('/logoff',
  function(req, res) {
    res.clearCookie('google-passport-example');
    res.redirect('/');
  }
);


// The usual pipeline stages

// Public files are still serverd as usual out of /public
app.get('/*',express.static('public'));

// special case for base URL, goes to index.html
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// Glitch assests directory 
app.use("/assets", assets);

// stage to serve files from /user, only works if user in logged in

// If user data is populated (by deserializeUser) and the
// session cookie is present, get files out 
// of /user using a static server. 
// Otherwise, user is redirected to public splash page (/index) by
// requireLogin (defined below)
app.get('/user/*', requireUser, requireLogin, express.static('.'));




// Now the pipeline stages that handle the login process itself

// Handler for url that starts off login with Google.
// The app (in public/index.html) links to here (note not an AJAX request!)
// Kicks off login process by telling Browser to redirect to Google.
app.get('/auth/google', passport.authenticate('google'));
// The first time its called, passport.authenticate sends 302 
// response (redirect) to the Browser
// with fancy redirect URL that Browser will send to Google,
// containing request for profile, and
// using this app's client ID string to identify the app trying to log in.
// The Browser passes this on to Google, which brings up the login screen. 


// Google redirects here after user successfully logs in. 
// This second call to "passport.authenticate" will issue Server's own HTTPS 
// request to Google to access the user's profile information with the  	
// temporary key we got from Google.
// After that, it calls gotProfile, so we can, for instance, store the profile in 
// a user database table. 
// Then it will call passport.serializeUser, also defined below.
// Then it either sends a response to Google redirecting to the /setcookie endpoint, below
// or, if failure, it goes back to the public splash page. 
app.get('/auth/accepted', 
  passport.authenticate('google', {
    successRedirect: '/setcookie', 
    failureRedirect: '/',
    scope: [ 'email', 'profile']
  })
);

// One more time! a cookie is set before redirecting
// to the protected homepage
// this route uses two middleware functions.
// requireUser is defined below; it makes sure req.user is defined
// The second one makse sure the referred request came from Google, and if so,
// goes ahead and marks the date of the cookie in a property called 
// google-passport-example
app.get('/setcookie', requireUser,
  function(req, res) {
    if(req.get('Referrer') && req.get('Referrer').indexOf("google.com")!=-1){
      // mark the birth of this cookie
      res.cookie('google-passport-example', new Date());
      res.redirect('/user/home.html');
    } else {
       res.redirect('/');
    }
  }
);

// Handle a post request to upload an image. 
app.post('/uploadImage', upload.single('newImage'), function (request, response) {
    console.log("Recieved", request.file.originalname, request.file.size, "bytes")
    
    let filename = "/images/" + request.file.originalname;
    if (request.file) {
        // file is automatically stored in /images with multer
        console.log("reqfile: ", request.file);
        // sendMediaStore(filename, request, response)
        response.end("recieved " + request.file.originalname);
    }
    else throw 'error';
});


// =================================== Database Interactions ==================================================
app.use(bodyParser.json());
// Handle a post request to upload an lost&found item data. 
app.post('/saveData', function (req, res) {
    console.log('recieved data', req.body);
    let data = req.body;

    cmd = ' INSERT INTO lostTable ( itemType, title, category, description, imageURL, date, location) VALUES (?,?,?,?,?,?,?) ';
    LostAndFoundDB.run(cmd, data.type, data.title, data.category, data.desc, data.img, data.date, data.location, function (err) {
        if (err) {
            console.log("DB insert error", err.message);
        } else {
            res.send(data);
        }
    }); // callback, LostAndFoundDB.run

});

// Handle a get request for retrieving lost and found items
app.get('/showItems', function (req, res) {
  // Commands for keyword searching in title and description: 
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\nSHOW ITEMS: ', req.query);
    cmd = `SELECT * FROM lostTable WHERE itemType='${req.query.type}'`;
    if (req.query.category !== '') {
      cmd += ` AND category='${req.query.category}'`;
    }
    if (req.query.location !== '') {
      cmd += ` AND location='${req.query.location}'`;
    }
    if (req.query.search !== '') {
      cmd += ` AND title LIKE '%${req.query.search}%'`;
    }
    cmd += ` AND date BETWEEN ${parseInt(req.query.start, 10)} AND ${parseInt(req.query.end, 10)} ;`;
  console.log(cmd);
    LostAndFoundDB.all(cmd, function (err, val) {
        console.log('value:', val);
        if (err) {
            console.log("DB insert error", err.message);
        } else {
            res.send(val);
        }
    }); // callback, LostAndFoundDB.run
});


// =================================== MAP Queries ==================================================

// USE REVERSE GEOCODING TO GET ADDRESS
// SEE https://developers.google.com/maps/documentation/geocoding/intro#reverse-example
app.get("/getAddress", (req, res) => {
  let url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + req.query.lat + ", " + req.query.lng + "&key="
  + process.env.API_KEY;
  request(url, { json: true }, (error, response, body) => {
    if (error) { return console.log(error); }
    res.json(body);
  });
})

// USE KEYWORDS TO FIND ADDRESS
// SEE https://developers.google.com/places/web-service/search#find-place-examples
app.get("/searchAddress", (req, res) => {
  // LOCATION BIAS
  var url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" + req.query.input
  + "&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&locationbias=circle:100000@38.5367859,-121.7553711&key="
  + process.env.API_KEY;
  request(url, { json: true }, (error, response, body) => {
    if (error) { return console.log(error); }
    res.json(body);
  });
})




// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});


// Some functions called by the handlers in the pipeline above


// Function for debugging. Just prints the incoming URL, and calls next.
// Never sends response back. 
function printIncomingRequest (req, res, next) {
    console.log("Serving",req.url);
    if (req.cookies) {
      console.log("cookies",req.cookies)
    }
    next();
}

// function that handles response from Google containint the profiles information. 
// It is called by Passport after the second time passport.authenticate
// is called (in /auth/accepted/)
function gotProfile(accessToken, refreshToken, profile, done) {
    // here is a good place to check if user is in DB,
    // and to store him in DB if not already there. 
    // Second arg to "done" will be passed into serializeUser,
    // should be key to get user out of database.
    let email = "INVALID-EMAIL";
    if (profile._json.hd === 'ucdavis.edu') {
       email = "VALID-EMAIL";
    } else {
        request.get('https://accounts.google.com/o/oauth2/revoke', {
        qs:{token: accessToken }},  function (err, res, body) {
            console.log("revoked token");
        });
    }

    done(null, email);
}

// Part of Server's sesssion set-up.  
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie. 
// For instance, if there was some specific profile information, or
// some user history with this Website we pull out of the user table
// using dbRowID.  But for now we'll just pass out the dbRowID itself.
passport.serializeUser((userdata, done) => {
    console.log("SerializeUser. Input is",userdata);
    done(null, userdata);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie (so, while user is logged in)
// This time, 
// whatever we pass in the "done" callback goes into the req.user property
// and can be grabbed from there by other middleware functions
passport.deserializeUser((userdata, done) => {
    console.log("deserializeUser. Input is:", userdata);
    // here is a good place to look up user data in database using
    // dbRowID. Put whatever you want into an object. It ends up
    // as the property "user" of the "req" object. 
    ///let userData = {userData: "maybe data from db row goes here"};
    done(null, userdata);
});


function requireUser (req, res, next) {
  if (req.user === "INVALID-EMAIL") {
    res.redirect('/?email=notUCD');
  } else if (!req.user) {
    res.redirect('/');
  } else {
    //console.log("user is",req.user);
    next();
  }
};

function requireLogin (req, res, next) {
  //console.log("checking:",req.cookies, req);
  if (!req.cookies['ecs162-session-cookie']) {
    res.redirect('/');
  } else {
    next();
  }
};



/*
// function called when the button is pushed
// handles the upload to the media storage API
function sendMediaStore(filename, serverRequest, serverResponse) {
    let apiKey = process.env.ECS162KEY;
    if (apiKey === undefined) {
      serverResponse.status(400);
      serverResponse.send("No API key provided");
    } else {
      // we'll send the image from the server in a FormData object
      let form = new FormData();
      
      // we can stick other stuff in there too, like the apiKey
      form.append("apiKey", apiKey);
      // stick the image into the formdata object
      form.append("storeImage", fs.createReadStream(__dirname + filename));
      // and send it off to this URL
      form.submit("http://ecs162.org:3000/fileUploadToAPI", function(err, APIres) {
        // did we get a response from the API server at all?
        fs.unlink(__dirname + filename, (err) => {
            if (err) {
              console.error(err)
              return
            }
          
            //file removed
          })
        if (APIres) {
          // OK we did
          console.log("API response status", APIres.statusCode);
          // the body arrives in chunks - how gruesome!
          // this is the kind stream handling that the body-parser 
          // module handles for us in Express.  
          let body = "";
          APIres.on("data", chunk => {
            body += chunk;
          });
          APIres.on("end", () => {
            // now we have the whole body
            if (APIres.statusCode != 200) {
              serverResponse.status(400); // bad request
              serverResponse.send(" Media server says: " + body);
            } else {
              serverResponse.status(200);
              console.log("body:", body);
              serverResponse.send(body);
            }
          });
        } else { // didn't get APIres at all
          serverResponse.status(500); // internal server error
          serverResponse.send("Media server seems to be down.");
        }
      });
    }
  }
  */