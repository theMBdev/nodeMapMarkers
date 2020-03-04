const express = require('express');
const router = express.Router();

const approval_controller = require('../controllers/approval.controller');
const { ensureAuthenticated, ensureAuthenticatedAdmin, forwardAuthenticated } = require('../config/auth');

router.get('/approval', ensureAuthenticatedAdmin, approval_controller.load_markers);
router.post('/approval', ensureAuthenticatedAdmin, approval_controller.approve_marker);
router.post('/reject', ensureAuthenticatedAdmin, approval_controller.reject_marker);

module.exports = router;