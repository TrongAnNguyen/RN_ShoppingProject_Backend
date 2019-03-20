const router = require('express').Router();
const jwt = require('jsonwebtoken');
const keys = require('./../config/keys');
const bcrypt = require('bcrypt');

router.post('/login', async function(req, res, next) {
    const client = await pool.connect();
    try {
        const { email, password } = req.body;
        const result = await client.query("SELECT * FROM accounts WHERE email = $1", [email]);
        if (result.rows[0] == null) {
            return res.json({ message: 'INCORRECT_EMAIL_OR_PASSWORD' });
        } else {
            const match = await bcrypt.compare(password, result.rows[0].password);
            if (match) {
                const user = result.rows[0];
                const token = jwt.sign(user, keys.jwt_key);
                return res.json({
                    message: 'LOGIN_SUCCESSFULLY',
                    user,
                    token
                });
            } else {
                return res.json({ message: 'INCORRECT_EMAIL_OR_PASSWORD' });
            }
        }
    } catch (err) {
        return res.send(err);
    } finally {
        client.release();
    }
});

router.post('/signup', async function(req, res, next) {
    const client = await pool.connect();
    try {
        const { fullName, email, password } = req.body;
        let result = await client.query("SELECT * FROM accounts WHERE email = $1", [email]);
        if (result.rows.length !== 0) {
            return res.json({ message: "EMAIL_ALREADY_EXISTS" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        client.query("INSERT INTO public.accounts (email, password, full_name) VALUES ($1, $2, $3) RETURNING *", [email, hashPassword, fullName])
        .then(result => {
            console.log(result);
            return res.json({ message: "SIGNUP_SUCCESSFULLY" });
        }).catch(e => {
            console.log(e);
            return res.json({ message: "Something went error" });
        });
    } catch (error) {
        console.log(error);
        next(error);
    } finally {
        client.release();
    }
});

router.post('/validate-token', async function(req, res, next) {
    const { token } = req.body;
    const client = await pool.connect();
    try {
        const user = await jwt.verify(token, keys.jwt_key);
        client.query('SELECT * FROM accounts WHERE id = $1', [user.id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.json({
                    message: "INVALID_TOKEN"
                });
            }
            return res.json({
                message: "VALID_TOKEN",
                user: result.rows[0]
            });
        }).catch(error => {
            console.log(error);
            return res.json({
                message: "Unknow error"
            });
        });
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Invalid token"
        });
    } finally {
        client.release();
    }
});

// Testing only
router.get('/user', async (req, res, next) => {
    const client = await pool.connect();
    try {
        client.query('select * from accounts').then(result => {
            console.log(result);
        }).catch(e => {
            console.log(e);
        });
    } catch (error) {
        console.log(error);
        next(error);
    } finally {
        client.release();
    }
});

module.exports = router;
