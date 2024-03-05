import { pgTable, integer, serial, text, time} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial('id').primaryKey(),
    username: text('username'),
    email: text('email').unique(),
    password: text('password'),
    createdAt: time('created_at').notNull().defaultNow(),
    followerCount: integer('follower_count')
});

export const posts = pgTable("posts", {
    id: serial('id').primaryKey(),
    userid: integer('userid').notNull().references(() => users.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    link: text("link"),
    linkDescription: text("link_description"),
    numberofLikes: integer("number_of_likes").notNull().default(0),
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
export type Likes = typeof likes.$inferSelect
export type UserFollows = typeof userFollows.$inferSelect