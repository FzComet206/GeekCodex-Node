import express from 'express';
import routes from '../routes';
import cors from 'cors';
import { config } from 'dotenv';
config();

import session from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import { feedLimiter } from '../utils/helper';

const corsOptions = {
    origin: process.env.PROD? process.env.ORIGIN : process.env.ORIGIN_DEV,
    credentials: true
}

declare module "express-session" {
    interface SessionData {
        userId?: number;
    }
}

const RedisStore = connectRedis(session);
const redis = new Redis(
    {
        host: process.env.PROD? process.env.REDISHOST : process.env.REDISHOST_DEV,
        port: parseInt(process.env.REDISPORT || '6379'),
    }
);

export const redisClient = redis;

export function creatApp(){
    const app = express();
    app.use(cors(corsOptions))

    app.use(express.json())

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