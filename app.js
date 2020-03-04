const express = require('express')
const app = express()

// Module imports
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');

// Passport Config
require('./config/passport')(passport);

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Models
const PointsModel = require('./models/points')
const UserModel = require('./models/user')

// Routes
const user = require('./routes/user.route');
const approval = require('./routes/approval.route');

const mongoose = require("./database");
const { ensureAuthenticated, ensureAuthenticatedAdmin, forwardAuthenticated } = require('./config/auth');

const path = require('path');
const publicPath = path.join(__dirname, 'public');
// to serve static files
app.use(express.static(publicPath));

// passwords
// username and password imported
// Heroku MODE -
const config = require('./configForHeroku');

// DEV MODE -
//var config = require('./config/config');
//mongodbUser = config.mongodbUser;
//mongodbPassword = config.mongodbPassword;
//dbString = config.dbString;
//cloudinaryName = config.cloudinaryName;
//cloudinaryApiKey = config.cloudinaryApiKey;
//cloudinaryApiSecret = config.cloudinaryApiSecret;

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

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

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

app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/user', user);
app.use('/approval', approval);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('listening on 3000')
})

// set the view engine to ejs
app.set('view engine', 'ejs');


app.get('/', function(req,res) {
    res.render('index', {user: req.user});
});

app.get('/worldLandmarks', function(req, res, next) {
    PointsModel.find({approved: "true"}, function(err, points) {
        res.render('worldLandmarks', { title: 'Express', points: points, user: req.user });
    });
});





