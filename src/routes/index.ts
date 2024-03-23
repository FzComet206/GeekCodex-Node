// main router
import { Router } from "express";
const router = Router();
import authRouter from './auth';
import { Request, Response, NextFunction } from "express";

import { posts } from "../models/schema";
import { db } from "../index";
import client from "../config/drizzle";
import { date, timestamp } from "drizzle-orm/pg-core";

export interface PostData {
    id: number;
    title: string;
    body: string;
    link: string;
    image: string;
    created_at: Date;
    likes: number;
    author: string;
    isLiked: boolean;
    authorFollowed: boolean;
}
// promisify file system functions
const fetchPosts = async (limit: number, offset: number, seed: number) => {

    // await client.query('SELECT setseed($1)', [seed]);

    const query = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        ORDER BY posts.created_at DESC
        LIMIT $1 OFFSET $2;
    `;
    // console.log(limit)
    // console.log(offset)
    return await client.query(query, [limit, offset]);
}

const fetchPostsSelf = async (limit: number, offset: number, userid: number) => {

    const query = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        WHERE posts.userid = $3
        ORDER BY posts.created_at DESC
        LIMIT $1 OFFSET $2;
    `;
    // console.log(limit)
    // console.log(offset)
    return await client.query(query, [limit, offset, userid!]);
}

const verifyPostUser = async (userid: number, postid: number) => {

    const query = `
        SELECT * FROM posts
        WHERE userid = $1 AND id = $2;
    `;
    return await client.query(query, [userid, postid]);
}

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {

    if (req.session.userId) {
        console.log(req.session.userId + " is authenticated");
        next(); // Proceed if authenticated
    } else {
        res.status(401).send('Unauthorized');
    }
}

router.get('/like', ensureAuthenticated, async (req, res) => {
    const postid = parseInt(req.query.postid as string);
    const userid = req.session.userId;

    if (postid && userid) {
        const isLikedQuery = `
            SELECT * FROM likes
            WHERE userid = $1 AND postid = $2;
        `;
        if ((await client.query(isLikedQuery, [userid, postid])).rows.length > 0) {
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
            await client.query(deleteLike, [userid, postid]);
            await client.query(updatePostLike, [postid]);
            const likes = await client.query(getNumberOfLikes, [postid]);
            console.log("Post disliked")
            res.status(200).json({
                message: "Post disliked",
                likes: likes.rows[0].number_of_likes,
                liked: false 
            });
            return;
        } else {
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
            await client.query(insertLike, [userid, postid]);
            await client.query(updatePostLike, [postid]);
            const likes: any = await client.query(getNumberOfLikes, [postid]);
            console.log("Post liked")
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
})

router.get('/delete', ensureAuthenticated, async (req, res) => {
    console.log("server delete")
    const id = parseInt(req.query.id as string);
    const userid = req.session.userId;
    if (id && userid) {
        const data = await verifyPostUser(userid, id);
        if (data.rows.length > 0){
            const query = `
                DELETE FROM posts
                WHERE id = $1;
            `;
            await client.query(query, [id]);
        }
        res.status(200).json({
            message: "Post deleted",
            image: data.rows[0].image
        });
        return;
    }

    res.status(400).json({
        message: "Invalid input"
    });
})

router.get('/self', ensureAuthenticated, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 4;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const userid = req.session.userId;
    try {
        const results = await fetchPostsSelf(limit, offset, userid!)

        let posts: PostData[] = new Array();
        results.rows.forEach(async element => {
            const isLiked = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
                `;
            const liked = (await client.query(isLiked, [userid, element.id])).rows.length > 0;
            const p: PostData = {
                id : element.id,
                title : element.title,
                body : element.body,
                link : element.link,
                image : element.image,
                created_at : element.created_at,
                likes : element.number_of_likes,
                author: element.author,
                isLiked: liked,
                authorFollowed: false
            }
            posts.push(p);
        });

        // console.log(posts)
        setTimeout(() => {
            res.status(200).json(posts)
        }, 100);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

router.get('/feed', ensureAuthenticated, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 4;
    const page = parseInt(req.query.page as string) || 1;
    const seed = parseFloat(req.query.seed as string) || 0.5;
    const offset = (page - 1) * limit;
    const userid = req.session.userId;

    try {
        const results = await fetchPosts(limit, offset, seed)

        let posts: PostData[] = new Array();
        results.rows.forEach(async element => {
            const isLiked = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
                `;
            const liked = (await client.query(isLiked, [userid, element.id])).rows.length > 0;
            const p: PostData = {
                id : element.id,
                title : element.title,
                body : element.body,
                link : element.link,
                image : element.image,
                created_at : element.created_at,
                likes : element.number_of_likes,
                author: element.author,
                isLiked: liked,
                authorFollowed: false
            }
            posts.push(p);
        });

        // console.log(posts)
        setTimeout(() => {
            res.status(200).json(posts)
        }, 100);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

router.post('/post', ensureAuthenticated, async (req, res) => {

    // todo: on post, index vocabularies

    const { title, summary, link, type} = req.body;
    
    const serverCheck = (
        (title.length < 1 || title.length > 80) ||
        (summary.length < 1 || summary.length > 5000) ||
        (link.length > 200)
    );

    if (serverCheck) {
        res.status(400).json({
            message: "Invalid input"
        })
        return;
    }

    const userId = req.session.userId!;
    const image_postgres = "https://rsdev.s3.amazonaws.com/" + userId.toString() + "_" + new Date().getTime().toString() + "." + type;
    const image_s3 = userId.toString() + "_" + new Date().getTime().toString() + "." + type;

    console.log("image postgres: " + image_postgres)
    // insertion operation
    if (req.session.userId) {
        await db.insert(posts).values({
            userid : userId,
            title: title,
            body: summary,
            link: link,
            image: image_postgres 
        }).execute();
    } else {
        res.status(500).json({
            message: "session userid not found"
        })
    }

    res.status(200).json({
        message: "Post successful",
        url: image_s3 
    });
})

router.use('/auth', authRouter);

export default router;