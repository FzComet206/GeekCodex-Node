import { config } from 'dotenv';
config();

import { Client } from "pg"

const client = new Client({
    host: process.env.DBHOST,
    port: parseInt(process.env.DBPORT || "5432"),
    user: process.env.DBUSER,
    password: `${process.env.DBPASSWORD}`,
    database: process.env.DBNAME,
});

export default client;
