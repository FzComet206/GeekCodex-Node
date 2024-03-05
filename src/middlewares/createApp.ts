import express from 'express';
import routes from '../routes';
import cors from 'cors';
import { config } from 'dotenv';
config();

import session from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';

const corsOptions = {
    origin: process.env.ORIGIN,
    credentials: true
}

declare module "express-session" {
    interface SessionData {
        userId?: number;
    }
}

export function creatApp(){
    const app = express();
    // app.use(bodyParser.json());

    // connect to redis server
    // const redisClient = createClient();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    // const redisStore = new RedisStore({ client: redis});

    // redisClient.connect().catch(err => {
            // console.log("redis connect error")
            // console.log(err)});
    // use cors middleware

    app.use(cors(corsOptions))
    // use express session middleware and store session in redis
    app.use(
        session({
            name: "Codex",
            store: new RedisStore({ client: redis, disableTouch: true}),
            secret: process.env.SESSIONSECRET || "secret",
            saveUninitialized: false,
            resave: false,
            cookie: {
                sameSite: 'strict',
                secure: false,
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24,
            }})
        );

    // use routes
    app.use('/api', routes);
    
    return app;
}