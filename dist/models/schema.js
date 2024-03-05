"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFollows = exports.likes = exports.posts = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    username: (0, pg_core_1.text)('username'),
    email: (0, pg_core_1.text)('email').unique(),
    password: (0, pg_core_1.text)('password'),
    createdAt: (0, pg_core_1.time)('created_at').notNull().defaultNow(),
    followerCount: (0, pg_core_1.integer)('follower_count')
});
exports.posts = (0, pg_core_1.pgTable)("posts", {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userid: (0, pg_core_1.integer)('userid').notNull().references(() => exports.users.id),
    title: (0, pg_core_1.text)("title").notNull(),
    body: (0, pg_core_1.text)("body").notNull(),
    link: (0, pg_core_1.text)("link"),
    linkDescription: (0, pg_core_1.text)("link_description"),
    numberofLikes: (0, pg_core_1.integer)("number_of_likes").notNull().default(0),
    createdAt: (0, pg_core_1.time)('created_at').notNull().defaultNow(),
});
exports.likes = (0, pg_core_1.pgTable)("likes", {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userid: (0, pg_core_1.integer)('userid').notNull().references(() => exports.users.id),
    postid: (0, pg_core_1.integer)('postid').notNull().references(() => exports.posts.id),
    createdAt: (0, pg_core_1.time)('created_at').notNull().defaultNow(),
});
exports.userFollows = (0, pg_core_1.pgTable)("user_follows", {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    followerid: (0, pg_core_1.integer)('followerid').notNull().references(() => exports.users.id),
    followingid: (0, pg_core_1.integer)('followingid').notNull().references(() => exports.users.id),
});
