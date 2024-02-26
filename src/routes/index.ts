import { Router } from "express";

// main router
const router = Router();
import authRouter from './auth';

router.use('/auth', authRouter);
router.get('/', (req, res) => {
    res.json({
        id: 1,
        img: "url",
        creator : "leo",
        ingredients: ["flour", "sugar", "butter"],
        title: "main router",
        description: "this is the main router",
        rating: 5,
        views: 100,
        likes: 100,
        comments: "comments",

    });
})

export default router;