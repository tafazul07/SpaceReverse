const express = require("express");
const {Pool} = require('pg');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json);

const pool = new Pool({
    connectionString: process.env.DATA_CONNECTION,
    ssl: {rejectUnauthorized: false}
});


