module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');

        res.redirect('/user/register');

    },
    ensureAuthenticatedAdmin: function(req, res, next) {
        if (req.isAuthenticated()) {
            console.log("Username", req.user.username)
            if(req.user.username == "admin") {
                return next();
            }           
        }
        req.flash('error_msg', 'Please log in to view that resource');

        res.redirect('/user/login');

    },
    forwardAuthenticated: function(req, res, next) {
        // if not authenticated take user to wherever you say
        if (!req.isAuthenticated()) {
            return next();
        }
        // if authenticated take user to dashboard
        res.redirect('/');      
    }
};
