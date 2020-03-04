const PointsModel = require('../models/points');

exports.load_markers = function(req, res) {    
    PointsModel.find({approved: "awaiting"}, function(err, points) {
        res.render('approval', { title: 'Express', points: points, user: req.user });
    });
};

exports.approve_marker = function(req, res) {    
    PointsModel.findOneAndUpdate({ _id: req.body.id }, { approved: "true" }).then(function() {
        res.send('Marker Approved');
    });;
};

exports.reject_marker = function(req, res) {    
    PointsModel.findOneAndUpdate({ _id: req.body.id }, { approved: "Rejected" }).then(function() {
        res.send('Marker Rejected');
    });
};