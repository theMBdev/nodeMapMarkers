const express = require('express');
const router = express.Router();

const { ensureAuthenticated, ensureAuthenticatedAdmin, forwardAuthenticated } = require('../config/auth');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Passport Config
require('../config/passport')(passport);

// Passport middleware
router.use(passport.initialize());
router.use(passport.session());


// Welcome Page
router.get('/welcome', forwardAuthenticated, (req, res) => res.render('welcome'));

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
