const express = require('express')
const app = express()

const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');

// Passport Config
require('./config/passport')(passport);

// Express body parser
app.use(express.urlencoded({ extended: true }));



const path = require('path');
const publicPath = path.join(__dirname, 'public');
// to serve static files
app.use(express.static(publicPath));
//app.use(express.static('public'));

// passwords
// username and password imported
// DEV MODE -
//var config = require('./config');

// Heroku MODE -
var config = require('./configForHeroku');

mongodbUser = config.mongodbUser;
mongodbPassword = config.mongodbPassword;
dbString = config.dbString;
cloudinaryName = config.cloudinaryName;
cloudinaryApiKey = config.cloudinaryApiKey;
cloudinaryApiSecret = config.cloudinaryApiSecret;


// marker import ?
const mongoose = require("./database");


// MULTER
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        console.log(file)
        cb(null, file.originalname)
    }
})

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())



////mongo
//MongoClient.connect('mongodb://' + mongodbUser +':'+ mongodbPassword + dbString, { useNewUrlParser: true }, function(err, db) {
//    if (err) throw err;
//
//    dbo = db.db("node-maps");
//
//    app.listen(3000, () => {
//        console.log('listening on 3000')
//    })
//});




// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//// Routes
//app.use('/base', require('./routes/index.js'));
//app.use('/users', require('./routes/users.js'));

const { ensureAuthenticated, ensureAuthenticatedAdmin, forwardAuthenticated } = require('./config/auth');

// Welcome Page
app.get('/welcome', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
app.get('/dashboard', ensureAuthenticated, (req, res) => {

    console.log(req.user)

    PointsModel.find({username: req.user.username}, function(err, points) {

        console.log(points);
        res.render('dashboard', { title: 'Express', user: req.user, points: points });
    });

})
// go to dashboard if user is Authenticated

// page open to all
app.get('/openpage', (req, res) => res.render('openpage'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('listening on 3000')
})


// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', function(req,res) {
    res.render('index', {user: req.user});
});


let PointsModel = require('./models/points')
let UserModel = require('./models/user')

app.get('/profile', function(req, res, next) {

    if (req.user) {
        console.log(req.user.username)
    } else {
        console.log("No signed in user")
    }

    // get input from url
    var userInUrl = req.query.user;

    if(userInUrl) {
        // make lowercase    
        var userLower = userInUrl.toLowerCase();

        // TODO change name in sign up to username and check it for dups like email
        // when inserting username make it be all lower case and same when an input
        UserModel.findOne({username : userLower}, function(err, user) {
            if(user) {
                console.log("User Exists")
                res.render('profile', {user: user});            
            } else {
                console.log("No User")
                res.render('errorPage');
            }
        });

    } else {
        res.render('errorPage');
    }
});

app.get('/worldLandmarks', function(req, res, next) {


    PointsModel.find({approved: "true"}, function(err, points) {

        res.render('worldLandmarks', { title: 'Express', points: points, user: req.user });

    });
});

// approval page
app.get('/approval', ensureAuthenticatedAdmin, function(req, res, next) {
    
    PointsModel.find({approved: "awaiting"}, function(err, points) {
        res.render('approval', { title: 'Express', points: points, user: req.user });
    });
});

app.post('/approval', (req, res, next) => {
    
    PointsModel.findOneAndUpdate({ _id: req.body.id }, { approved: "true" }).then(function() {
        res.redirect('/worldLandmarks')
    })
})

app.post('/reject', (req, res, next) => {
    
    PointsModel.findOneAndUpdate({ _id: req.body.id }, { approved: "Rejected" }).then(function() {
        res.redirect('/worldLandmarks')
    })
})


app.post('/upload', ensureAuthenticated, (req, res, next) => {

    var markerArray = req.body.markerImageArray.split(",");
    var tagsArray = req.body.tags.split(",");

    console.log(req.user);    

    // if user is admin
    if (req.user.username == "admin") {
        console.log("Admin in the house")
        //save marker to db
        let newPoint = new PointsModel({
            'name': req.body.name,
            'date': req.body.date,
            'location.type': 'Point',
            'location.coordinates': [req.body.lng , req.body.lat],
            'markerImageArray': markerArray,
            'tags': tagsArray,
            'username': req.user.username,
            'approved': "true"
        })

        newPoint.save()
            .then(doc => {
            console.log(doc)
            res.redirect('/worldLandmarks')

        }).catch(err => {
            console.error(err)
        })

        // if user is not admin but is a user (signed in)
    } else if (req.user) {        

        let newPoint = new PointsModel({
            'name': req.body.name,
            'date': req.body.date,
            'location.type': 'Point',
            'location.coordinates': [req.body.lng , req.body.lat],
            'markerImageArray': markerArray,             
            'tags': tagsArray,
            'username': req.user.username,
            'approved': "awaiting"
        })

        newPoint.save()
            .then(doc => {
            req.flash(
                'success_msg',
                'Post Success - Awaiting manual approval - can take up to 12 hours'
            );
            console.log(doc)
            res.redirect('/worldLandmarks')


        }).catch(err => {
            console.error(err)
        })
    }
    // in here means there is no user so we never want this action to happen
    // stop non logged in users from pressing the add to map button (ADD PHOTO)
    // when user clicks the add photo button - bring down the sign in/sign up modal if no user else normal flow



})




// ALL FROM routes.users
// Login Page
app.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
app.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
app.post('/register', (req, res) => {
    const { username, email, password, password2 } = req.body;
    let errors = [];

    if (!username || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            username,
            email,
            password,
            password2
        });
    } else {

        UserModel.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('register', {
                    errors,
                    username,
                    email,
                    password,
                    password2
                });
            } else {

                UserModel.findOne({ username: username }).then(user => {
                    if (user) {
                        errors.push({ msg: 'Username already exists' });
                        res.render('register', {
                            errors,
                            username,
                            email,
                            password,
                            password2
                        });
                    } else {

                        const newUser = new UserModel({
                            username,
                            email,
                            password
                        });

                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                // make name lowercase - TODO change to username when ready
                                newUser.username = newUser.username.toLowerCase();
                                newUser
                                    .save()
                                    .then(user => {
                                    req.flash(
                                        'success_msg',
                                        'You are now registered and can log in'
                                    );
                                    res.redirect('/login');
                                })
                                    .catch(err => console.log(err));
                            });
                        });
                    }
                });
            }
        });
    };
});

// Login 
app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    })(req, res, next);
});

// Logout
app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});