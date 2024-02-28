import { config } from 'dotenv';
config();

import express, { Express } from 'express';
import routes from './routes';
import cors from 'cors';
import bodyParser from 'body-parser';

const corsOptions = {
    origin: process.env.ORIGIN
}

const PORT = process.env.PORT || 3002

function creatApp() : Express {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors(corsOptions))
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