const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret-abcxyz',
};

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function (email, password, cb) {
    loginAttempt();

    async function loginAttempt() {
        const client = await poll.connect();
        try {
            await client.query('BEGIN');
            const res = await client.query("SELECT * FROM accounts WHERE email = $1", email);
            if (res.rows[0] == null) {
                return cb(null, false, { message: 'Incorrect email or password' });
            } else {
                const match = await bcrypt.compare(password, res.rows[0].password);
                if (match) {
                    return cb(null, res.rows[0], { message: 'User logged in.' });
                } else {
                    return cb(null, false, { message: 'Incorrect email or password' });
                }
            }
        } catch (err) {
            return cb(err);
        } finally {
            client.release();
        }
    }
}
));

