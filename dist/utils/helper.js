"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = exports.ensureAuthenticated = exports.verifyPostUser = exports.sendVerifySES = exports.sendResetSES = exports.actionLimiter = exports.feedLimiter = exports.authLimiter = exports.loginLimiter = exports.postLimiter = exports.deleteLimiter = exports.emailLimiter = void 0;
const argon2_1 = __importDefault(require("argon2"));
const client_ses_1 = require("@aws-sdk/client-ses");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.emailLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minutes
    max: 4, // limit each IP to 6 requests per windowMs
});
exports.deleteLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minutes
    max: 60, // limit each IP to 6 requests per windowMs
});
exports.postLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minutes
    max: 6, // limit each IP to 6 requests per windowMs
});
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minutes
    max: 12, // limit each IP to 6 requests per windowMs
});
// used for all auth operations
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minutes
    max: 12, // limit each IP to 6 requests per windowMs
});
// used for all feed and me operations
exports.feedLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minutes
    max: 120, // limit each IP to 120 requests per windowMs
});
exports.actionLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minutes
    max: 60, // limit each IP to 6 requests per windowMs
});
const sendResetSES = (to, url) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new client_ses_1.SESClient({
        region: process.env.SES_REGION,
        credentials: {
            accessKeyId: process.env.SES_KEY,
            secretAccessKey: process.env.SES_SECRET
        }
    });
    const input = {
        "Destination": {
            "ToAddresses": [
                `${to}`
            ]
        },
        "Message": {
            "Body": {
                "Html": {
                    "Charset": "UTF-8",
                    // "Data": `click the following link to reset your password: ${url}`
                    "Data": "<html><body><h3>Link Valid for 15 Minutes</h3><p>Click the following link to reset your password: <a href='" + url + `'>${url}</a></p></body></html>`
                },
            },
            "Subject": {
                "Charset": "UTF-8",
                "Data": "GeekCodex Password Reset"
            }
        },
        "Source": "no-reply@geekcodex.org",
    };
    const command = new client_ses_1.SendEmailCommand(input);
    console.log("Sending email to " + to);
    return yield client.send(command);
});
exports.sendResetSES = sendResetSES;
const sendVerifySES = (to, url) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new client_ses_1.SESClient({
        region: process.env.SES_REGION,
        credentials: {
            accessKeyId: process.env.SES_KEY,
            secretAccessKey: process.env.SES_SECRET
        }
    });
    const input = {
        "Destination": {
            "ToAddresses": [
                `${to}`
            ]
        },
        "Message": {
            "Body": {
                "Html": {
                    "Charset": "UTF-8",
                    // "Data": `click the following link to reset your password: ${url}`
                    "Data": "<html><body><h3>Link Valid for 15 Minutes</h3><p>Click the following link to verify your email: <a href='" + url + `'>${url}</a></p></body></html>`
                },
            },
            "Subject": {
                "Charset": "UTF-8",
                "Data": "GeekCodex Verify Email"
            }
        },
        "Source": "no-reply@geekcodex.org",
    };
    const command = new client_ses_1.SendEmailCommand(input);
    console.log("Sending email to " + to);
    return yield client.send(command);
});
exports.sendVerifySES = sendVerifySES;
const verifyPostUser = (client, userid, postid) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
        SELECT * FROM posts
        WHERE userid = $1 AND id = $2;
    `;
    return yield client.query(query, [userid, postid]);
});
exports.verifyPostUser = verifyPostUser;
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        console.log(req.session.userId + " is authenticated");
        next(); // Proceed if authenticated
    }
    else {
        res.status(401).send('Unauthorized');
    }
}
exports.ensureAuthenticated = ensureAuthenticated;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashed = yield argon2_1.default.hash(password, {
        type: argon2_1.default.argon2id
    });
    return hashed;
});
exports.hashPassword = hashPassword;
const verifyPassword = (hashedPassword, password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield argon2_1.default.verify(hashedPassword, password);
});
exports.verifyPassword = verifyPassword;
