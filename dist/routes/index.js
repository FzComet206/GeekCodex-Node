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
const drizzle_1 = __importDefault(require("../config/drizzle"));
// promisify file system functions
const fetchPosts = (limit, offset, seed) => __awaiter(void 0, void 0, void 0, function* () {
    yield drizzle_1.default.query('SELECT setseed($1)', [seed]);
    const query = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        ORDER BY RANDOM()
        LIMIT $1 OFFSET $2;
    `;
    // console.log(limit)
    // console.log(offset)
    return yield drizzle_1.default.query(query, [limit, offset]);
});
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
router.get('/feed', ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 4;
    const page = parseInt(req.query.page) || 1;
    const seed = parseFloat(req.query.seed) || 0.5;
    const offset = (page - 1) * limit;
    try {
        const results = yield fetchPosts(limit, offset, seed);
        let posts = new Array();
        results.rows.forEach(element => {
            const p = {
                id: element.id,
                title: element.title,
                body: element.body,
                link: element.link,
                image: element.image,
                created_at: element.created_at,
                likes: element.number_of_likes,
                author: element.author
            };
            posts.push(p);
        });
        // console.log(posts)
        res.status(200).json(posts);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.post('/post', ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // todo: on post, index vocabularies
    const { title, summary, link, image } = req.body;
    const serverCheck = ((title.length < 1 || title.length > 80) ||
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
