const router = require('express').Router();
const jwt = require('jsonwebtoken');
const keys = require('./../config/keys');

const verifyToken = async (req, res, next) => {
    const { token } = req.body;
    const client = await pool.connect();
    try {
        const user = await jwt.verify(token, keys.jwt_key);
        client.query('SELECT * FROM accounts WHERE id = $1', [user.id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.json({
                    message: "Invalid token"
                });
            }
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



router.get('/profile', verifyToken ,function(req, res, next) {
    return res.json({ message: 'hello' });
});

module.exports = router;
