const express = require('express');
const router = express.Router();

const { ensureAuthenticated, ensureAuthenticatedAdmin, forwardAuthenticated } = require('../config/auth');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const PointsModel = require('../models/points');

// Passport Config
require('../config/passport')(passport);

// Passport middleware
router.use(passport.initialize());
router.use(passport.session());


// Welcome Page
router.get('/welcome', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {

    console.log(req.user)

    PointsModel.find({username: req.user.username}, function(err, points) {

        console.log(points);
        res.render('dashboard', { title: 'Express', user: req.user, points: points });
    });

})

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
    console.log("REG")
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
                                    res.redirect('/user/login');
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

router.post('/upload', ensureAuthenticated, (req, res, next) => {

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


// Login 
router.post('/login', (req, res, next) => {
    console.log("HERE")
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/register',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

module.exports = router;
