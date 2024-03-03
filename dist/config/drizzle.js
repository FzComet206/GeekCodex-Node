"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const pg_1 = require("pg");
const client = new pg_1.Client({
    host: process.env.DBHOST,
    port: parseInt(process.env.DBPORT || "5432"),
    user: process.env.DBUSER,
    password: `${process.env.DBPASSWORD}`,
    database: process.env.DBNAME,
});
exports.default = client;
