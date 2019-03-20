const router = require('express').Router();
const jwt = require('jsonwebtoken');
const keys = require('./../config/keys');

const verifyToken = async (req, res, next) => {
    
    
    const client = await pool.connect();
    try {
        const { token } = req.body;
        const user = await jwt.verify(token, keys.jwt_key);
        client.query('SELECT * FROM accounts WHERE id = $1', [user.id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.json({
                    message: "Invalid token"
                });
            }
            res.locals.user = user;
            next();
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
}

router.post('/order-history', verifyToken, async function(req, res, next) {
    const client = await pool.connect();
    try {
        let result = await client.query("SELECT b.id, b.date_order, b.total, b.status FROM bill b INNER JOIN accounts a ON b.id_customer = a.id WHERE a.email = $1", [res.locals.user.email]);
        if (result.rows.length === 0) {
            return res.json({ message: "EMPTY" });
        }
        return res.json({
            message: "SUCCESSFULLY",
            orderHistory: result.rows
        });
    } catch (error) {
        console.log(error);
        next(error);
    } finally {
        client.release();
    }
});

router.get('/profile', verifyToken ,function(req, res, next) {
    return res.json({ message: 'hello' });
});

module.exports = router;
