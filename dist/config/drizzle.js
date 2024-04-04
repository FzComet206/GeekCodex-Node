"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const pg_1 = require("pg");
const host = process.env.PROD ? process.env.DBHOST : process.env.DBHOST_DEV;
const port = parseInt(process.env.DBPORT || "5432");
const user = process.env.DBUSER;
const password = process.env.PROD ? `${process.env.DBPASSWORD}` : `${process.env.DBPASSWORD_DEV}`;
const database = process.env.DBNAME;
const redishost = process.env.PROD ? process.env.REDISHOST : process.env.REDISHOST_DEV;
const serverOrigin = process.env.PROD ? process.env.ORIGIN : process.env.ORIGIN_DEV;
console.log("PROD: ", process.env.PROD ? "true" : "false");
console.log("DBHOST: ", host);
console.log("DBPORT: ", port);
console.log("DBUSER: ", user);
console.log("DBPASSWORD", password);
console.log("DBNAME: ", database);
console.log("REDISHOST: ", redishost);
console.log("ORIGIN: ", serverOrigin);
const client = new pg_1.Client({
    host: host,
    port: port,
    user: user,
    password: password,
    database: database,
    ssl: {
        rejectUnauthorized: false
    }
});
exports.default = client;
