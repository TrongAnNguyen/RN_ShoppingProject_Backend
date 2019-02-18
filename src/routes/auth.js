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
            return res.json({ message: 'Incorrect email or password' });
        } else {
            const match = await bcrypt.compare(password, result.rows[0].password);
            if (match) {
                const user = result.rows[0];
                const token = jwt.sign(user, keys.jwt_key);
                return res.json({
                    message: 'User logged in.',
                    user,
                    token
                });
            } else {
                return res.json({ message: 'Incorrect email or password' });
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
        const { email, password } = req.body;
        let result = await client.query("SELECT * FROM accounts WHERE email = $1", [email]);
        if (result.rows.length !== 0) {
            return res.json({ message: "Email already exists" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        client.query("INSERT INTO public.accounts (email, password) VALUES ($1, $2) RETURNING *", [email, hashPassword])
        .then(result => {
            console.log(result);
            return res.json({ message: "Signup successfully" });
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
