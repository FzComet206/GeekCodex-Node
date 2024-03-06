import { relations } from "drizzle-orm";
import { pgTable, integer, serial, text, time, customType} from "drizzle-orm/pg-core";
import { blob } from "drizzle-orm/sqlite-core";

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return "bytea";
  },
});

export const users = pgTable("users", {
    id: serial('id').primaryKey(),
    username: text('username'),
    email: text('email').unique(),
    password: text('password'),
    createdAt: time('created_at').notNull().defaultNow(),
    followerCount: integer('follower_count').notNull().default(0),
});

export const posts = pgTable("posts", {
    id: serial('id').primaryKey(),
    userid: integer('userid').notNull().references(() => users.id),
    image: bytea("image"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    link: text("link"),
    linkDescription: text("link_description"),
    numberofLikes: integer("number_of_likes").notNull().default(0),
    createdAt: time('created_at').notNull().defaultNow(),
});

export const comments = pgTable("comments", {
    id: serial('id').primaryKey(),
    userid: integer('userid').notNull().references(() => users.id),
    postid: integer('postid').notNull().references(() => posts.id),
    body: text("body").notNull(),
    createdAt: time('created_at').notNull().defaultNow(),
});

export const likes = pgTable("likes", {
    id: serial('id').primaryKey(),
    userid: integer('userid').notNull().references(() => users.id),
    postid: integer('postid').notNull().references(() => posts.id),
    createdAt: time('created_at').notNull().defaultNow(),
});

export const userFollows = pgTable("user_follows", {
    id: serial('id').primaryKey(),
    followerid: integer('followerid').notNull().references(() => users.id),
    followingid: integer('followingid').notNull().references(() => users.id),
});

export type Users = typeof users.$inferSelect
export type Posts = typeof posts.$inferSelect
export type Comments = typeof comments.$inferSelect
export type Likes = typeof likes.$inferSelect
export type UserFollows = typeof userFollows.$inferSelect

// defining relations
export const userRelations = relations(users, ({many}) => ({
    posts: many(posts),
    comments: many(comments),
    likes: many(likes),
    followers: many(userFollows),
    following: many(userFollows)
}))

export const postRelations = relations(posts, ({one, many}) => ({
    user: one(users, {fields: [posts.userid], references: [users.id]}),
    comment: many(comments),
}))

export const commentRelations = relations(comments, ({one}) => ({
    user: one(users, {fields: [comments.userid], references: [users.id]}),
    post: one(posts, {fields: [comments.postid], references: [posts.id]}),
}))

export const likeRelations = relations(likes, ({one}) => ({
    user: one(users, {fields: [likes.userid], references: [users.id]}),
    post: one(posts, {fields: [likes.postid], references: [posts.id]}),
}))

export const userFollowRelations = relations(userFollows, ({one}) => ({
    follower: one(users, {fields: [userFollows.followerid], references: [users.id]}),
    following: one(users, {fields: [userFollows.followingid], references: [users.id]}),
}))