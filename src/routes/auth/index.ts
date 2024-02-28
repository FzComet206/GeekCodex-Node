// copilot keys: alt + ], ctrl + enter, ctrl + -> <-  and generating code using comments
import { Router } from "express";
import argon2, { hash } from "argon2";

const router = Router();

const hashPassword = async (password: string) => {
    const hashed = await argon2.hash(password, {
        type: argon2.argon2id
    });
    return hashed;
}

router.post('/register', async (req, res) => {
    res.json({
        text: "server register action"
    });
    console.log(req.body);
    const p = await hashPassword(req.body.password);
    console.log(p);
})


export default router;