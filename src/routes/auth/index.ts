// copilot keys: alt + ], ctrl + enter, ctrl + -> <-  and generating code using comments

import { Router } from "express";

const router = Router();

router.get('/', (req, res) => {
    res.json({
        text: "hi this is auth router sb leo"
    });
})


export default router;