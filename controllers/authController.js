const passport = require('../config/passport');

exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleCallback = passport.authenticate('google', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/dashboard');
}

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
};