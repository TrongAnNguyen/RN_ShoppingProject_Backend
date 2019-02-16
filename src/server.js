const express   = require('express');
const app       = express();
const port      = process.env.PORT || 8080;
const passport  = require('passport');
const morgan    = require('morgan');
const { Poll }  = require('pg');
const keys  = require('./config/keys');

const poll = new Poll(keys.database);
global.poll = poll;

require('./config/passport');

