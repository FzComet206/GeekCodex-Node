import { Router } from "express";

// main router
const router = Router();
import authRouter from './auth';

router.use('/auth', authRouter);
router.get('/', (req, res) => {
    res.json({
        text: "hi this is main router"
    });
})

export default router;