const express = require('express');
const router = express.Router();

const PointsModel = require('../models/points');

const { ensureAuthenticated, ensureAuthenticatedAdmin, forwardAuthenticated } = require('../config/auth');

router.get('/approval', ensureAuthenticatedAdmin, function(req, res, next) {
    
    PointsModel.find({approved: "awaiting"}, function(err, points) {
        res.render('approval', { title: 'Express', points: points, user: req.user });
    });
});

router.post('/approval', (req, res, next) => {
    
    PointsModel.findOneAndUpdate({ _id: req.body.id }, { approved: "true" }).then(function() {
        res.redirect('/worldLandmarks')
    })
})

router.post('/reject', (req, res, next) => {
    
    PointsModel.findOneAndUpdate({ _id: req.body.id }, { approved: "Rejected" }).then(function() {
        res.redirect('/worldLandmarks')
    })
})

module.exports = router;