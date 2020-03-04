const express = require('express');
const router = express.Router();

const { ensureAuthenticated, ensureAuthenticatedAdmin, forwardAuthenticated } = require('../config/auth');
const user_controller = require('../controllers/user.controller');

// Login or register page
router.get('/loginOrRegister', forwardAuthenticated, user_controller.login_register);
// My submissions page
router.get('/mySubmissions', ensureAuthenticated, user_controller.my_submissions);
// Login Page
router.get('/login', forwardAuthenticated, user_controller.login_page);
// Register Page
router.get('/register', forwardAuthenticated, user_controller.register_page);

// Register a new user
router.post('/register', user_controller.register_user);
// Upload new marker
router.post('/upload', ensureAuthenticated, user_controller.new_marker);

// Login 
router.post('/login', user_controller.login);
// Logout
router.get('/logout', user_controller.logout);

module.exports = router;
