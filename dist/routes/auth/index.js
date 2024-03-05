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
const router = (0, express_1.Router)();
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashed = yield argon2_1.default.hash(password, {
        type: argon2_1.default.argon2id
    });
    return hashed;
});
function ensureAuthenticated(req, res, next) {
    console.log(req.session.userId);
    if (req.session.userId) {
        next(); // Proceed if authenticated
    }
    else {
        res.status(401).send('Unauthorized');
    }
}
router.get('/me', ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // add logic
    console.log(req.session.userId);
    res.status(200).json({
        userId: 1,
        username: "antares",
        token: "token"
    });
}));
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({
                message: "Internal server error"
            });
        }
        else {
            res.clearCookie("Codex");
            res.send("Logged out");
        }
    });
    //res.clearCookie("Codex", {
    //sameSite: 'strict',
    //secure: false,
    //httpOnly: true,
    //maxAge: 1000 * 60 * 60 * 24,
    //})
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = req.session;
    // set auth logic here
    session.userId = 1;
    res.status(200).json({
        userId: 1,
        userName: "antares",
        token: "token"
    });
}));
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // set register logic here
    req.session.userId = 20;
    res.status(200).json({
        username: "Antares",
        token: "token"
    });
    //const user = await db.select().from(users).where(eq(users.email, req.body.email)).execute();
    //if (user.length > 0) {
    //res.status(404).json({
    //message: "user already exists"
    //})
    //} else {
    //await db.insert(users).values({
    //username: req.body.name,
    //email: req.body.email,
    //password: await hashPassword(req.body.password),
    //}).execute();
    //res.json({
    //text: "server register action"
    //});
    //(req.session as CustomSession).userId = user[0].id;
    //(req.session as CustomSession).name = user[0].username || "undefined user";
    //}
}));
exports.default = router;
