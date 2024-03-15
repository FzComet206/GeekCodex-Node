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
// copilot keys: alt + ], ctrl + enter, ctrl + -> <-  and generating code using comments
const express_1 = require("express");
const argon2_1 = __importDefault(require("argon2"));
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const index_1 = require("../../index");
const router = (0, express_1.Router)();
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashed = yield argon2_1.default.hash(password, {
        type: argon2_1.default.argon2id
    });
    return hashed;
});
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        console.log(req.session.userId + " is authenticated");
        next(); // Proceed if authenticated
    }
    else {
        res.status(401).send('Unauthorized');
    }
}
router.get('/me', ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, req.session.userId)).execute();
    if (user.length == 0) {
        res.status(404).json({
            message: "user not found"
        });
        return;
    }
    res.status(200).json({
        username: user[0].username,
    });
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const user = yield index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).execute();
    console.log(req.body);
    if (user.length == 0) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    // passsword check
    try {
        if (yield argon2_1.default.verify(user[0].password, req.body.password)) {
            req.session.userId = user[0].id;
            res.status(200).json({
                username: user[0].username
            });
        }
        else {
            res.status(401).json({
                message: "Invalid password"
            });
        }
    }
    catch (_a) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({
                message: "Internal server error"
            });
        }
        else {
            res.clearCookie("Codex", {
                domain: "localhost",
                path: "/",
                sameSite: 'strict',
                httpOnly: true,
                secure: false
            });
            res.send("Logged out");
        }
    });
}));
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const serverCheck = ((name.length < 3 || name.length > 12) ||
        (email.length < 4 || email.length > 50 || email.indexOf('@') === -1 || email.indexOf('.') === -1) ||
        (password.length < 8 || password.length > 20));
    if (serverCheck) {
        res.status(400).json({
            message: "Invalid input"
        });
        return;
    }
    // check if user already exists through email
    const existing = yield index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).execute();
    if (existing.length > 0) {
        res.status(401).json({
            message: "User already exists"
        });
        return;
    }
    // register user
    const hashed = hashPassword(req.body.password);
    index_1.db.insert(schema_1.users).values({
        username: req.body.name,
        email: req.body.email,
        password: yield hashed,
    }).execute();
    // login user by setting userid
    const user = yield index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).execute();
    req.session.userId = user[0].id;
    res.status(200).json({
        username: name,
    });
}));
exports.default = router;
