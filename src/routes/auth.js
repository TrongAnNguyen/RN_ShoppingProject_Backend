const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('./../config/keys');

router.post('/login', function(req, res, next) {
    passport.authenticate('local-login', { session: false }, (error, user, info) => {
        if (error || !user) {
            return res.status(400).json({
                error,
                user,
                message: info.message
            });
        }
        req.login(user, (err) => {
            res.send(err);
        });

        const token = jwt.sign(user, keys.jwt_key);
        return res.json({ user, token });
    })(req, res, next);
});