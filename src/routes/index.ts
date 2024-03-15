// main router
import { Router } from "express";
const router = Router();
import authRouter from './auth';
import { Request, Response, NextFunction } from "express";

import { posts } from "../models/schema";
import { db } from "../index";

// promisify file system functions

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {

    console.log(req.session.userId)
    if (req.session.userId) {
        console.log(req.session.userId + " is authenticated");
        next(); // Proceed if authenticated
    } else {
        res.status(401).send('Unauthorized');
    }
}

router.post('/post', ensureAuthenticated, async (req, res) => {

    const { title, summary, link, image } = req.body;
    
    const serverCheck = (
        (title.length < 1 || title.length > 30) ||
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