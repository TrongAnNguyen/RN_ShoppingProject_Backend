const express   = require('express');
const app       = express();
const port      = process.env.PORT || 8080;
const morgan    = require('morgan');
const bodyParser = require('body-parser');
const { Pool }  = require('pg');
const path = require('path');
const keys  = require('./src/config/keys');
const auth = require('./src/routes/auth');
const user = require('./src/routes/user');
const product = require('./src/routes/product');

global.appRoot = path.resolve(__dirname);

// Config database
const pool = new Pool(keys.database);
global.pool = pool;

app.use(morgan());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routing
app.use('/auth', auth);
app.use('/user', user);
app.use('/product', product);

app.listen(port, () => {
    console.log('Server running on port: ', port);
});
