const { drizzle } = require("drizzle-orm/node-postgres");
const { migrate } = require("drizzle-orm/node-postgres/migrator");
const { Client } = require("pg");
require("dotenv").config();

const main = async () => {

    const client = new Client({
        host: process.env.DBHOST,
        port: parseInt(process.env.DBPORT || "5432"),
        user: process.env.DBUSER,
        password: `${process.env.DBPASSWORD}`,
        database: process.env.DBNAME,
    });

    try {
        await client.connect();
        const db = await drizzle(client);
        await migrate(db, {
            migrationsFolder: "./src/migrations",
        }) 

        console.log("Migration complete");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed", e);
        process.exit(1);
    }
}

main();

