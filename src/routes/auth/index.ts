// copilot keys: alt + ], ctrl + enter, ctrl + -> <-  and generating code using comments
import { Router } from "express";
import argon2, { hash } from "argon2";
import { Session } from "express-session";

interface CustomSession extends Session {
    userId? : number;
    name? : string;
}

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
    const p = await hashPassword(req.body.password);
    console.log(req.body);
    console.log(req.session.cookie);
    
    (req.session as CustomSession).userId = 20;
    (req.session as CustomSession).name = "Antares";
    // set up register session
})


export default router;