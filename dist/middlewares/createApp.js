"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatApp = void 0;
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("../routes"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const redis_1 = require("redis");
const corsOptions = {
    origin: process.env.ORIGIN
};
function creatApp() {
    const app = (0, express_1.default)();
    app.use(body_parser_1.default.json());
    // connect to redis server
    const redisClient = (0, redis_1.createClient)();
    redisClient.connect().catch(err => {
        console.log("redis connect error");
        console.log(err);
    });
    console.log("redis connected successfully");
    let store = new connect_redis_1.default({ client: redisClient, prefix: "rsapp" });
    // use express session middleware and store session in redis
    app.use((0, express_session_1.default)({
        store: store,
        secret: process.env.SESSIONSECRET || "",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
        }
    }));
    // use cors middleware
    app.use((0, cors_1.default)(corsOptions));
    // use routes
    app.use('/api', routes_1.default);
    return app;
}
exports.creatApp = creatApp;
