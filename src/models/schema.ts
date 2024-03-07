import { relations } from "drizzle-orm";
import { pgTable, integer, serial, text, customType, timestamp} from "drizzle-orm/pg-core";


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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    followerCount: integer('follower_count').notNull().default(0),
});

export const posts = pgTable("posts", {
    id: serial('id').primaryKey(),
    userid: integer('userid').notNull().references(() => users.id),
    imageid: integer('imageid').references(() => postImages.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    link: text("link"),
    linkDescription: text("link_description"),
    numberofLikes: integer("number_of_likes").notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const comments = pgTable("comments", {
    id: serial('id').primaryKey(),
    userid: integer('userid').notNull().references(() => users.id),
    postid: integer('postid').notNull().references(() => posts.id),
    body: text("body").notNull(),
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

export const postImages = pgTable("post_images", {
    id: serial('id').primaryKey(),
    alt: text('alt').notNull(),
    image: bytea('image').notNull(),
});

export type Users = typeof users.$inferSelect
export type Posts = typeof posts.$inferSelect
export type Comments = typeof comments.$inferSelect
export type Likes = typeof likes.$inferSelect
export type UserFollows = typeof userFollows.$inferSelect
export type PostImages = typeof postImages.$inferSelect

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
    image: one(postImages, {fields: [posts.imageid], references: [postImages.id]}),
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

export const postImageRelations = relations(postImages, ({one}) => ({
    post: one(posts, {fields: [postImages.id], references: [posts.imageid]}),
}))