import { config } from 'dotenv';
import { creatApp } from './middlewares/createApp';
config();

// drizzle configuration
import { drizzle } from 'drizzle-orm/node-postgres'
import client from './config/drizzle';

const PORT = process.env.PORT;

async function main(){

    try {
        await client.connect();
        // const db = await drizzle(client);
        console.log("db connected successfully");

    } catch (err) {
        console.log(err);
        console.log('connect to database failed');
    }

    try {
        const app = creatApp();
        app.listen(PORT, () => console.log(`running on port ${PORT}`));
        console.log(`Running in ${process.env.PORT}`);
    } catch(err) {
        console.log(err);
    }

}

main();
