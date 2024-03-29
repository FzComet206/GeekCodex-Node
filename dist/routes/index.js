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
const auth_1 = __importDefault(require("./auth"));
const schema_1 = require("../models/schema");
const index_1 = require("../index");
const drizzle_1 = __importDefault(require("../config/drizzle"));
const queries_1 = require("../utils/queries");
const helper_1 = require("../utils/helper");
const router = (0, express_1.Router)();
router.get('/user', helper_1.feedLimiter, helper_1.ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 4;
    const page = parseInt(req.query.page) || 1;
    const id = parseInt(req.query.userid);
    const offset = (page - 1) * limit;
    const userid = req.session.userId;
    try {
        const results = yield drizzle_1.default.query(queries_1.FETCH_SELF_POSTS, [limit, offset, id]);
        let posts = new Array();
        results.rows.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
            const isLiked = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
                `;
            const liked = (yield drizzle_1.default.query(isLiked, [userid, element.id])).rows.length > 0;
            const isFollowedQuery = `
                SELECT * FROM user_follows
                WHERE followerid = $1 AND followingid = $2;
            `;
            const followed = (yield drizzle_1.default.query(isFollowedQuery, [userid, element.userid])).rows.length > 0;
            const p = {
                id: element.id,
                title: element.title,
                body: element.body,
                link: element.link,
                image: element.image,
                created_at: element.created_at,
                likes: element.number_of_likes,
                author: element.author,
                authorid: element.userid,
                isLiked: liked,
                authorFollowed: followed
            };
            posts.push(p);
        }));
        // console.log(posts)
        setTimeout(() => {
            res.status(200).json(posts);
        }, 100);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.get('/dashboard', helper_1.feedLimiter, helper_1.ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const limit = parseInt(req.query.limit) || 4;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const userid = req.session.userId;
    try {
        const followers = yield drizzle_1.default.query(queries_1.FETCH_FOLLOWER_INFO, [userid, limit, offset]);
        const following = yield drizzle_1.default.query(queries_1.FETCH_FOLLOWING_INFO, [userid, limit, offset]);
        const likes = yield drizzle_1.default.query(queries_1.FETCH_LIKE_INFO, [userid, limit, offset]);
        let dashboard = new Array();
        const max = Math.max(followers.rows.length, following.rows.length, likes.rows.length);
        for (let i = 0; i < max; i++) {
            dashboard.push({
                follower: ((_a = followers.rows[i]) === null || _a === void 0 ? void 0 : _a.username) || null,
                followerid: ((_b = followers.rows[i]) === null || _b === void 0 ? void 0 : _b.id) || null,
                following: ((_c = following.rows[i]) === null || _c === void 0 ? void 0 : _c.username) || null,
                followingid: ((_d = following.rows[i]) === null || _d === void 0 ? void 0 : _d.id) || null,
                likeuser: ((_e = likes.rows[i]) === null || _e === void 0 ? void 0 : _e.username) || null,
                likeuserid: ((_f = likes.rows[i]) === null || _f === void 0 ? void 0 : _f.id) || null,
                likeposttitle: ((_g = likes.rows[i]) === null || _g === void 0 ? void 0 : _g.title) || null,
                timestamp: ((_h = likes.rows[i]) === null || _h === void 0 ? void 0 : _h.created_at) || null
            });
        }
        setTimeout(() => {
            res.status(200).json(dashboard);
        }, 100);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.get('/follow', helper_1.actionLimiter, helper_1.ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authorid = parseInt(req.query.authorid);
    const userid = req.session.userId;
    if (authorid && userid) {
        const isFollowedQuery = `
            SELECT * FROM user_follows
            WHERE followerid = $1 AND followingid = $2;
        `;
        if ((yield drizzle_1.default.query(isFollowedQuery, [userid, authorid])).rows.length > 0) {
            // unfollow
            try {
                yield drizzle_1.default.query(queries_1.DELETE_USER_FOLLOWS, [userid, authorid]);
            }
            catch (err) {
                console.error(err);
                res.status(500).json({
                    message: "Internal server error"
                });
            }
            res.status(200).json({
                message: "Unfollowed"
            });
            return;
        }
        else {
            // follow
            const insertFollow = `
                INSERT INTO user_follows (followerid, followingid)
                VALUES ($1, $2);
            `;
            try {
                yield drizzle_1.default.query(queries_1.SET_USER_FOLLOWS, [userid, authorid]);
            }
            catch (err) {
                console.error(err);
                res.status(500).json({
                    message: "Internal server error"
                });
            }
            res.status(200).json({
                message: "Followed"
            });
            return;
        }
    }
    res.status(400).json({
        message: "Invalid input"
    });
}));
router.get('/like', helper_1.actionLimiter, helper_1.ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postid = parseInt(req.query.postid);
    const userid = req.session.userId;
    if (postid && userid) {
        const isLikedQuery = `
            SELECT * FROM likes
            WHERE userid = $1 AND postid = $2;
        `;
        if ((yield drizzle_1.default.query(isLikedQuery, [userid, postid])).rows.length > 0) {
            // dislike
            const deleteLike = `
                DELETE FROM likes
                WHERE userid = $1 AND postid = $2;
            `;
            const updatePostLike = `
                UPDATE posts
                SET number_of_likes = number_of_likes - 1
                WHERE id = $1;
            `;
            const getNumberOfLikes = `
                SELECT number_of_likes FROM posts WHERE id = $1;
            `;
            yield drizzle_1.default.query(deleteLike, [userid, postid]);
            yield drizzle_1.default.query(updatePostLike, [postid]);
            const likes = yield drizzle_1.default.query(getNumberOfLikes, [postid]);
            console.log("Post disliked");
            res.status(200).json({
                message: "Post disliked",
                likes: likes.rows[0].number_of_likes,
                liked: false
            });
            return;
        }
        else {
            // like
            const insertLike = `
                INSERT INTO likes (userid, postid)
                VALUES ($1, $2);
            `;
            const updatePostLike = `
                UPDATE posts
                SET number_of_likes = number_of_likes + 1
                WHERE id = $1;
            `;
            const getNumberOfLikes = `
                SELECT number_of_likes FROM posts WHERE id = $1;
            `;
            yield drizzle_1.default.query(insertLike, [userid, postid]);
            yield drizzle_1.default.query(updatePostLike, [postid]);
            const likes = yield drizzle_1.default.query(getNumberOfLikes, [postid]);
            console.log("Post liked");
            res.status(200).json({
                message: "Post liked",
                likes: likes.rows[0].number_of_likes,
                liked: true
            });
            return;
        }
    }
    res.status(400).json({
        message: "Invalid input"
    });
}));
router.get('/delete', helper_1.deleteLimiter, helper_1.ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("server delete");
    const id = parseInt(req.query.id);
    const userid = req.session.userId;
    if (id && userid) {
        console.log("id and userid");
        const user = yield drizzle_1.default.query(`SELECT * FROM users WHERE id = $1`, [userid]);
        if (user.rows[0].is_op == 1) {
            const ref = yield drizzle_1.default.query(`SELECT * FROM posts WHERE id = $1`, [id]);
            const deleteLikes = `
                DELETE FROM likes
                WHERE postid = $1;
            `;
            yield drizzle_1.default.query(deleteLikes, [id]);
            const query = `
                DELETE FROM posts
                WHERE id = $1;
            `;
            yield drizzle_1.default.query(query, [id]);
            console.log("op delete");
            res.status(200).json({
                message: "Post deleted by op",
                image: ref.rows[0].image
            });
            return;
        }
        const data = yield (0, helper_1.verifyPostUser)(drizzle_1.default, userid, id);
        console.log("verify");
        if (data.rows.length > 0) {
            const deleteLikes = `
                DELETE FROM likes
                WHERE postid = $1;
            `;
            yield drizzle_1.default.query(deleteLikes, [id]);
            const query = `
                DELETE FROM posts
                WHERE id = $1;
            `;
            yield drizzle_1.default.query(query, [id]);
            console.log("normal delete");
            res.status(200).json({
                message: "Post deleted",
                image: data.rows[0].image
            });
            return;
        }
    }
    res.status(400).json({
        message: "Invalid input"
    });
}));
router.get('/likedposts', helper_1.feedLimiter, helper_1.ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 4;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const userid = req.session.userId;
    try {
        const results = yield drizzle_1.default.query(queries_1.FETCH_LIKED_POSTS, [userid, limit, offset]);
        let posts = new Array();
        results.rows.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
            const isLiked = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
                `;
            const liked = (yield drizzle_1.default.query(isLiked, [userid, element.id])).rows.length > 0;
            const isFollowedQuery = `
                SELECT * FROM user_follows
                WHERE followerid = $1 AND followingid = $2;
            `;
            const followed = (yield drizzle_1.default.query(isFollowedQuery, [userid, element.userid])).rows.length > 0;
            const p = {
                id: element.id,
                title: element.title,
                body: element.body,
                link: element.link,
                image: element.image,
                created_at: element.created_at,
                likes: element.number_of_likes,
                author: element.author,
                authorid: element.userid,
                isLiked: liked,
                authorFollowed: followed
            };
            posts.push(p);
        }));
        // console.log(posts)
        setTimeout(() => {
            res.status(200).json(posts);
        }, 100);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.get('/self', helper_1.feedLimiter, helper_1.ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 4;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const userid = req.session.userId;
    try {
        const results = yield drizzle_1.default.query(queries_1.FETCH_SELF_POSTS, [limit, offset, userid]);
        let posts = new Array();
        results.rows.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
            const isLiked = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
                `;
            const liked = (yield drizzle_1.default.query(isLiked, [userid, element.id])).rows.length > 0;
            const isFollowedQuery = `
                SELECT * FROM user_follows
                WHERE followerid = $1 AND followingid = $2;
            `;
            const followed = (yield drizzle_1.default.query(isFollowedQuery, [userid, element.userid])).rows.length > 0;
            const p = {
                id: element.id,
                title: element.title,
                body: element.body,
                link: element.link,
                image: element.image,
                created_at: element.created_at,
                likes: element.number_of_likes,
                author: element.author,
                authorid: element.userid,
                isLiked: liked,
                authorFollowed: followed
            };
            posts.push(p);
        }));
        // console.log(posts)
        setTimeout(() => {
            res.status(200).json(posts);
        }, 100);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.get('/feed', helper_1.feedLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 4;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search.split(/\s+/).join(' | ') || "";
    const sort = req.query.sort || "";
    const offset = (page - 1) * limit;
    const userid = req.session.userId;
    try {
        let results;
        if (search) {
            results = yield drizzle_1.default.query(queries_1.FETCH_POSTS_SEARCH, [limit, offset, search]);
        }
        else {
            if (sort) {
                results = yield drizzle_1.default.query(queries_1.FETCH_POSTS_SORT_LIKE, [limit, offset]);
            }
            else {
                results = yield drizzle_1.default.query(queries_1.FETCH_POSTS, [limit, offset]);
            }
        }
        let posts = new Array();
        results.rows.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
            const isLiked = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
                `;
            const liked = (yield drizzle_1.default.query(isLiked, [userid, element.id])).rows.length > 0;
            const isFollowedQuery = `
                SELECT * FROM user_follows
                WHERE followerid = $1 AND followingid = $2;
            `;
            const followed = (yield drizzle_1.default.query(isFollowedQuery, [userid, element.userid])).rows.length > 0;
            const p = {
                id: element.id,
                title: element.title,
                body: element.body,
                link: element.link,
                image: element.image,
                created_at: element.created_at,
                likes: element.number_of_likes,
                author: element.author,
                authorid: element.userid,
                isLiked: liked,
                authorFollowed: followed
            };
            posts.push(p);
        }));
        // console.log(posts)
        setTimeout(() => {
            res.status(200).json(posts);
        }, 100);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.post('/post', helper_1.postLimiter, helper_1.ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // todo: on post, index vocabularies
    const check_Postcount_query = `
        SELECT * FROM posts
        WHERE userid = $1;
    `;
    // a account can only have 20 posts maximum for now
    if ((yield drizzle_1.default.query(check_Postcount_query, [req.session.userId])).rows.length > 20) {
        console.log("Post limit reached");
        res.status(400).json({
            message: "Post limit reached"
        });
        return;
    }
    const { title, summary, link, type } = req.body;
    const serverCheck = ((title.length < 1 || title.length > 80) ||
        (summary.length < 1 || summary.length > 5000) ||
        (link.length > 200));
    if (serverCheck) {
        res.status(400).json({
            message: "Invalid input"
        });
        return;
    }
    const userId = req.session.userId;
    const image_postgres = "https://rsdev.s3.amazonaws.com/" + userId.toString() + "_" + new Date().getTime().toString() + "." + type;
    const image_s3 = userId.toString() + "_" + new Date().getTime().toString() + "." + type;
    // insertion operation
    if (req.session.userId) {
        yield index_1.db.insert(schema_1.posts).values({
            userid: userId,
            title: title,
            body: summary,
            link: link,
            image: image_postgres
        }).execute();
    }
    else {
        res.status(500).json({
            message: "session userid not found"
        });
    }
    res.status(200).json({
        message: "Post successful",
        url: image_s3
    });
}));
router.use('/auth', auth_1.default);
exports.default = router;
