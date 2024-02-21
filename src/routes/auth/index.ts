import { Router } from "express";

const router = Router();

router.get('/', (req, res) => {
    res.json({
        text: "hi this is auth router"
    });
})

export default router;