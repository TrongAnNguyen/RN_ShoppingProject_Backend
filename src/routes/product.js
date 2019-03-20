const router = require('express').Router();

router.get('/alltype', function(req, res, next) {
    (async () => {
        const client = await pool.connect();
        try {
            client.query('SELECT * FROM product_type')
            .then(result => {
                if (result.rows.length === 0) {
                    return res.json({ message: 'Product list is empty!' });
                }
                const productTypes = [];
                result.rows.forEach(row => {
                    productTypes.push({
                        id: row.id,
                        name: row.name,
                        image: row.image
                    });
                });
                return res.json(productTypes);
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

router.get('/top', async function(req, res, next) {
    (async () => {
        const client = await pool.connect();
        try {
            const sql = `SELECT p.id, p.name as name, p.id_type as idType, t.name as nameType, 
                        p.price, p.color, p.material, p.description, array_agg(i.link) as images 
                        FROM product p LEFT JOIN images i ON p.id = i.id_product 
                        inner join product_type t ON t.id = p.id_type 
                        where p.new = 1 group by p.id, p.name, p.id_type, t.name, p.price, 
                        p.color, p.material, p.description LIMIT 6`;
            client.query(sql)
            .then(result => {
                if (result.rows.length === 0) {
                    return res.json({ message: 'Product list is empty!' });
                }
                const topProduct = result.rows;
                return res.json(topProduct);
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

router.get('/bytype', async function(req, res, next) {
    (async () => {
        const client = await pool.connect();
        try {
            const { idType, page } = req.query;
            const limit = 5;
            const offset = (page - 1) * limit;
            const sql = `SELECT p.id, p.name, p.id_type, p.price, p.color, 
                    p.material, p.description, t.name as nameType, array_agg(i.link) AS images
                    FROM product p inner join product_type t ON t.id = p.id_type INNER 
                    JOIN images i ON i.id_product = p.id WHERE id_type = $1 GROUP BY 
                    p.id, p.name, p.id_type, t.name, p.price, p.color, p.material, 
                    p.description, t.name LIMIT ${limit} OFFSET ${offset}`;
            client.query(sql, [idType])
            .then(result => {
                if (result.rows.length === 0) {
                    return res.json({ message: 'Product list is empty!' });
                }
                return res.json({
                    message: 'SUCCESS',
                    product: result.rows
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

router.get('/image/type/:name', async function(req, res, next) {
    const imgName = req.params.name;
    const path = appRoot + '/images/type/' + imgName;
    return res.sendFile(path);
});

router.get('/image/:name', async function(req, res, next) {
    const imgName = req.params.name;
    const path = appRoot + '/images/product/' + imgName;
    return res.sendFile(path);
});

module.exports = router;
