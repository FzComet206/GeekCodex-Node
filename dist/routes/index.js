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
// main router
const express_1 = require("express");
const router = (0, express_1.Router)();
const auth_1 = __importDefault(require("./auth"));
const schema_1 = require("../models/schema");
const index_1 = require("../index");
// promisify file system functions
function ensureAuthenticated(req, res, next) {
    console.log(req.session.userId);
    if (req.session.userId) {
        console.log(req.session.userId + " is authenticated");
        next(); // Proceed if authenticated
    }
    else {
        res.status(401).send('Unauthorized');
    }
}
router.post('/post', ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, summary, link, image } = req.body;
    const serverCheck = ((title.length < 1 || title.length > 30) ||
        (summary.length < 1 || summary.length > 5000) ||
        (link.length > 200));
    if (serverCheck) {
        res.status(400).json({
            message: "Invalid input"
        });
        return;
    }
    // insertion operation
    if (req.session.userId) {
        yield index_1.db.insert(schema_1.posts).values({
            userid: req.session.userId,
            title: title,
            body: summary,
            link: link,
            image: image
        }).execute();
    }
    else {
        res.status(500).json({
            message: "session userid not found"
        });
    }
    res.status(200).json({
        message: "Post successful"
    });
}));
router.use('/auth', auth_1.default);
exports.default = router;
