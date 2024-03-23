import { relations } from "drizzle-orm";
import { pgTable, integer, serial, text, customType, timestamp} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial('id').primaryKey(),
    username: text('username'),
    email: text('email').unique(),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    followerCount: integer('follower_count').notNull().default(0),
});

export const posts = pgTable("posts", {
    id: serial('id').primaryKey(),
    userid: integer('userid').notNull().references(() => users.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    link: text("link"),
    image: text("image"),
    numberofLikes: integer("number_of_likes").notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const likes = pgTable("likes", {
    id: serial('id').primaryKey(),
    userid: integer('userid').notNull().references(() => users.id),
    postid: integer('postid').notNull().references(() => posts.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userFollows = pgTable("user_follows", {
    id: serial('id').primaryKey(),
    followerid: integer('followerid').notNull().references(() => users.id),
    followingid: integer('followingid').notNull().references(() => users.id),
});

export type Users = typeof users.$inferSelect
export type Posts = typeof posts.$inferSelect
export type Likes = typeof likes.$inferSelect
export type UserFollows = typeof userFollows.$inferSelect

// defining relations
export const userRelations = relations(users, ({many}) => ({
    posts: many(posts),
    likes: many(likes),
    followers: many(userFollows),
    following: many(userFollows)
}))

export const postRelations = relations(posts, ({one, many}) => ({
    user: one(users, {fields: [posts.userid], references: [users.id]}),
}))

export const likeRelations = relations(likes, ({one}) => ({
    user: one(users, {fields: [likes.userid], references: [users.id]}),
    post: one(posts, {fields: [likes.postid], references: [posts.id]}),
}))

export const userFollowRelations = relations(userFollows, ({one}) => ({
    follower: one(users, {fields: [userFollows.followerid], references: [users.id]}),
    following: one(users, {fields: [userFollows.followingid], references: [users.id]}),
}))
