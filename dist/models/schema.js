"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFollowRelations = exports.likeRelations = exports.commentRelations = exports.postRelations = exports.userRelations = exports.userFollows = exports.likes = exports.comments = exports.posts = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    username: (0, pg_core_1.text)('username'),
    email: (0, pg_core_1.text)('email').unique(),
    password: (0, pg_core_1.text)('password'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    followerCount: (0, pg_core_1.integer)('follower_count').notNull().default(0),
});
exports.posts = (0, pg_core_1.pgTable)("posts", {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userid: (0, pg_core_1.integer)('userid').notNull().references(() => exports.users.id),
    title: (0, pg_core_1.text)("title").notNull(),
    body: (0, pg_core_1.text)("body").notNull(),
    link: (0, pg_core_1.text)("link"),
    image: (0, pg_core_1.text)("image"),
    numberofLikes: (0, pg_core_1.integer)("number_of_likes").notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.comments = (0, pg_core_1.pgTable)("comments", {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userid: (0, pg_core_1.integer)('userid').notNull().references(() => exports.users.id),
    postid: (0, pg_core_1.integer)('postid').notNull().references(() => exports.posts.id),
    body: (0, pg_core_1.text)("body").notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.likes = (0, pg_core_1.pgTable)("likes", {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userid: (0, pg_core_1.integer)('userid').notNull().references(() => exports.users.id),
    postid: (0, pg_core_1.integer)('postid').notNull().references(() => exports.posts.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.userFollows = (0, pg_core_1.pgTable)("user_follows", {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    followerid: (0, pg_core_1.integer)('followerid').notNull().references(() => exports.users.id),
    followingid: (0, pg_core_1.integer)('followingid').notNull().references(() => exports.users.id),
});
// defining relations
exports.userRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    posts: many(exports.posts),
    comments: many(exports.comments),
    likes: many(exports.likes),
    followers: many(exports.userFollows),
    following: many(exports.userFollows)
}));
exports.postRelations = (0, drizzle_orm_1.relations)(exports.posts, ({ one, many }) => ({
    user: one(exports.users, { fields: [exports.posts.userid], references: [exports.users.id] }),
    comment: many(exports.comments),
}));
exports.commentRelations = (0, drizzle_orm_1.relations)(exports.comments, ({ one }) => ({
    user: one(exports.users, { fields: [exports.comments.userid], references: [exports.users.id] }),
    post: one(exports.posts, { fields: [exports.comments.postid], references: [exports.posts.id] }),
}));
exports.likeRelations = (0, drizzle_orm_1.relations)(exports.likes, ({ one }) => ({
    user: one(exports.users, { fields: [exports.likes.userid], references: [exports.users.id] }),
    post: one(exports.posts, { fields: [exports.likes.postid], references: [exports.posts.id] }),
}));
exports.userFollowRelations = (0, drizzle_orm_1.relations)(exports.userFollows, ({ one }) => ({
    follower: one(exports.users, { fields: [exports.userFollows.followerid], references: [exports.users.id] }),
    following: one(exports.users, { fields: [exports.userFollows.followingid], references: [exports.users.id] }),
}));
