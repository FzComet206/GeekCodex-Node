import { config } from 'dotenv';
config();

import express, { Express } from "express";
import routes from './routes';

const PORT = process.env.PORT || 3001;

function creatApp() : Express {
    const app = express();
    app.use('/api', routes);
    return app;
}

async function main(){
    try {
        const app = creatApp();
        app.listen(PORT, () => console.log(`running on port ${PORT}`));
        console.log(`Running in ${process.env.PORT}`);
    } catch(err) {
        console.log(err);
    }
}

main();