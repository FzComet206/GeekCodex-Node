import express, { Express, } from 'express';
import routes from '../routes';
import bodyParser from 'body-parser';
import cors from 'cors';
import { config } from 'dotenv';
config();

import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const corsOptions = {
    origin: process.env.ORIGIN
}

export function creatApp() : Express {
    const app = express();
    app.use(bodyParser.json());

    // connect to redis server
    const redisClient = createClient();
    redisClient.connect().catch(err => {
        console.log("redis connect error")
        console.log(err)
    });
    console.log("redis connected successfully")
    let store = new (RedisStore as any)({ client: redisClient, prefix: "rsapp"});

    // use express session middleware and store session in redis
    app.use(
        session({
            store: store,
            secret: process.env.SESSIONSECRET || "",
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: false,
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24,
            }})
        );

    // use cors middleware
    app.use(cors(corsOptions))
    // use routes
    app.use('/api', routes);
    return app;
}