// copilot keys: alt + ], ctrl + enter, ctrl + -> <-  and generating code using comments
import { Router } from "express";
import argon2, { hash } from "argon2";
import { Session } from "express-session";
import client from "../../config/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { users, Users} from "../../models/schema";
import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";

const router = Router();

const hashPassword = async (password: string) => {
    const hashed = await argon2.hash(password, {
        type: argon2.argon2id
    });
    return hashed;
}

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {

    console.log(req.session.userId);
    if (req.session.userId) {
        next(); // Proceed if authenticated
    } else {
        res.status(401).send('Unauthorized');
    }
}

router.get('/me', ensureAuthenticated, async (req, res) => {

    // add logic
    console.log(req.session.userId);
    res.status(200).json({
        username: "antares",
        token: "token"
    })
})

router.post('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({
                message: "Internal server error"
            });
        } else {
            res.clearCookie("Codex", {
                domain: "localhost",
                path: "/",
                sameSite: 'strict',
                httpOnly: true,
                secure: false
            })
            res.send("Logged out")
        }
    })


    // session is destroyed but cookie and redis store is not cleared

    //res.clearCookie("Codex", {
                //sameSite: 'strict',
                //secure: false,
                //httpOnly: true,
                //maxAge: 1000 * 60 * 60 * 24,
//})
})

router.post('/login', async (req, res) => {
    const session = req.session;

    // set auth logic here

    session.userId = 1;

    res.status(200).json({
        userId: 1,
        userName: "antares",
        token: "token"
    })
})

router.post('/register', async (req, res) => {

    // set register logic here

    req.session.userId = 20;

    res.status(200).json({
        username: "Antares",
        token: "token"
    })


     //const user = await db.select().from(users).where(eq(users.email, req.body.email)).execute();
     //if (user.length > 0) {
         //res.status(404).json({
             //message: "user already exists"
         //})
     //} else {
         //await db.insert(users).values({
             //username: req.body.name,
             //email: req.body.email,
             //password: await hashPassword(req.body.password),
         //}).execute();

         //res.json({
             //text: "server register action"
         //});
         //(req.session as CustomSession).userId = user[0].id;
         //(req.session as CustomSession).name = user[0].username || "undefined user";
     //}
})

export default router;