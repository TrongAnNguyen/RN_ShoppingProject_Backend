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

router.post('/profile', verifyToken, async function(req, res, next) {
    (async () => {
        const { fullName, address, phoneNumber } = req.body;
        const client = await pool.connect();
        try {
            const sql = `UPDATE accounts SET full_name = $1, address = $2, phone_number = $3
                    WHERE id = $4 RETURNING *`;
            client.query(sql, [fullName, address, phoneNumber, res.locals.user.id])
            .then(result => {
                if (result.rows.length === 0) {
                    return res.json({ message: 'No result!' });
                }
                return res.json({
                    message: 'SUCCESS',
                    user: result.rows[0]
                });
            }).catch(error => {
                console.log(error);
                return res.json({ message: 'Something went error!' });
            });
        } catch (error) {
            console.log(error);
            return res.json(error);
        } finally {
            client.release();
        }
    })().catch(error => {
        console.log(error);
        return res.json({ message: 'Something went error!' });
    });
});

router.post('/checkout', verifyToken, async function(req, res, next) {
    (async () => {
        const { cartItems, totalPrice } = req.body;
        const client = await pool.connect();
        try {
            const sql = `INSERT INTO bill (id_customer, date_order, total, status) VALUES
                    ($1, NOW(), $2, 1) RETURNING id`;
            client.query(sql, [res.locals.user.id, totalPrice])
            .then(result => {
                cartItems.forEach(item => {
                    const sql = `INSERT INTO bill_detail (id_bill, id_product, quantity, price) 
                        VALUES ($1, $2, $3, $4)`;
                    client.query(sql, [result.rows[0].id, item.id, item.quantity, item.price])
                    .then(result => {
                    }).catch(error => {
                        console.log(error);
                    });
                });
                return res.json({ message: 'SUCCESS' });
            }).catch(error => {
                console.log(error);
                return res.json({ message: 'Something went error!' });
            });
        } catch (error) {
            console.log(error);
            return res.json(error);
        } finally {
            client.release();
        }
    })().catch(error => {
        console.log(error);
        return res.json({ message: 'Something went error!' });
    });
});

module.exports = router;
