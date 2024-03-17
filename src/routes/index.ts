// main router
import { Router } from "express";
const router = Router();
import authRouter from './auth';
import { Request, Response, NextFunction } from "express";

import { posts } from "../models/schema";
import { db } from "../index";
import client from "../config/drizzle";

export interface PostData {
    id: number;
    title: string;
    body: string;
    link: string;
    image: string;
    created_at: Date;
    likes: number;
    author: string;
}
// promisify file system functions
const fetchPosts = async (limit: number, offset: number, seed: number) => {

    await client.query('SELECT setseed($1)', [seed]);

    const query = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        ORDER BY RANDOM()
        LIMIT $1 OFFSET $2;
    `;
    // console.log(limit)
    // console.log(offset)
    return await client.query(query, [limit, offset]);
}

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {

    console.log(req.session.userId)
    if (req.session.userId) {
        console.log(req.session.userId + " is authenticated");
        next(); // Proceed if authenticated
    } else {
        res.status(401).send('Unauthorized');
    }
}

router.get('/feed', ensureAuthenticated, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 4;
    const page = parseInt(req.query.page as string) || 1;
    const seed = parseFloat(req.query.seed as string) || 0.5;
    const offset = (page - 1) * limit;

    try {
        const results = await fetchPosts(limit, offset, seed)

        let posts: PostData[] = new Array();
        results.rows.forEach(element => {
            const p: PostData = {
                id : element.id,
                title : element.title,
                body : element.body,
                link : element.link,
                image : element.image,
                created_at : element.created_at,
                likes : element.number_of_likes,
                author: element.author
            }
            posts.push(p);
        });

        // console.log(posts)
        res.status(200).json(posts)
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

router.post('/post', ensureAuthenticated, async (req, res) => {

    // todo: on post, index vocabularies

    const { title, summary, link, image } = req.body;
    
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

    // insertion operation
    if (req.session.userId) {
        await db.insert(posts).values({
            userid: req.session.userId,
            title: title,
            body: summary,
            link: link,
            image: image
        }).execute();
    } else {
        res.status(500).json({
            message: "session userid not found"
        })
    }

    res.status(200).json({
        message: "Post successful"
    });
})

router.use('/auth', authRouter);

export default router;