import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD, 
    host: "localhost",
    port: 5432,
    database: process.env.DATABASE
});
