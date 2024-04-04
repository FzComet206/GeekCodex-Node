"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatApp = exports.redisClient = void 0;
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("../routes"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const ioredis_1 = __importDefault(require("ioredis"));
const corsOptions = {
    origin: process.env.PROD ? process.env.ORIGIN : process.env.ORIGIN_DEV,
    credentials: true
};
const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
const redis = new ioredis_1.default({
    host: process.env.PROD ? process.env.REDISHOST : process.env.REDISHOST_DEV,
    port: parseInt(process.env.REDISPORT || '6379'),
});
exports.redisClient = redis;
function creatApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)(corsOptions));
    app.use(express_1.default.json());
    app.use((0, express_session_1.default)({
        name: "Codex",
        store: new RedisStore({ client: redis, disableTouch: true }),
        secret: process.env.SESSIONSECRET || "secret",
        saveUninitialized: false,
        resave: false,
        cookie: {
            sameSite: 'strict',
            secure: false,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
        }
    }));
    // use routes
    app.use('/api', routes_1.default);
    return app;
}
exports.creatApp = creatApp;
