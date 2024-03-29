"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FETCH_LIKE_INFO = exports.FETCH_FOLLOWING_INFO = exports.FETCH_FOLLOWER_INFO = exports.SET_USER_FOLLOWS = exports.DELETE_USER_FOLLOWS = exports.FETCH_LIKED_POSTS = exports.FETCH_POSTS = exports.FETCH_POSTS_SORT_LIKE = exports.FETCH_POSTS_SEARCH = exports.FETCH_SELF_POSTS = void 0;
exports.FETCH_SELF_POSTS = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        WHERE posts.userid = $3
        ORDER BY posts.created_at DESC
        LIMIT $1 OFFSET $2;
    `;
exports.FETCH_POSTS_SEARCH = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        WHERE search_vector @@ to_tsquery('english', $3)
        ORDER BY ts_rank_cd(search_vector, to_tsquery('english', $3)) DESC
        LIMIT $1 OFFSET $2;
    `;
exports.FETCH_POSTS_SORT_LIKE = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        ORDER BY posts.number_of_Likes DESC, posts.created_at DESC
        LIMIT $1 OFFSET $2;
    `;
exports.FETCH_POSTS = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        ORDER BY posts.created_at DESC
        LIMIT $1 OFFSET $2;
    `;
exports.FETCH_LIKED_POSTS = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        JOIN likes ON posts.id = likes.postid
        WHERE likes.userid = $1
        ORDER BY posts.created_at DESC
        LIMIT $2 OFFSET $3;
    `;
exports.DELETE_USER_FOLLOWS = `
        DELETE FROM user_follows
        WHERE followerid = $1 AND followingid = $2;
    `;
exports.SET_USER_FOLLOWS = `
        INSERT INTO user_follows (followerid, followingid)
        VALUES ($1, $2);
    `;
exports.FETCH_FOLLOWER_INFO = `
        SELECT users.id, users.username
        FROM users
        JOIN user_follows ON users.id = user_follows.followerid
        WHERE user_follows.followingid = $1
        LIMIT $2 OFFSET $3;
    `;
exports.FETCH_FOLLOWING_INFO = `
        SELECT users.id, users.username
        FROM users
        JOIN user_follows ON users.id = user_follows.followingid
        WHERE user_follows.followerid = $1
        LIMIT $2 OFFSET $3;
    `;
exports.FETCH_LIKE_INFO = `
        SELECT users.id, users.username, posts.title, likes.created_at
        FROM likes
        JOIN users ON likes.userid = users.id
        JOIN posts ON likes.postid = posts.id
        WHERE posts.userid = $1
        ORDER BY likes.created_at DESC
        LIMIT $2 OFFSET $3;
    `;
