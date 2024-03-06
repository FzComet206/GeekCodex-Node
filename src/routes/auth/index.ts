// copilot keys: alt + ], ctrl + enter, ctrl + -> <-  and generating code using comments
import { Router } from "express";
import argon2, { hash } from "argon2";
import { users, Users} from "../../models/schema";
import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { db } from "../../index";
import { except } from "drizzle-orm/mysql-core";

const router = Router();

const hashPassword = async (password: string) => {
    const hashed = await argon2.hash(password, {
        type: argon2.argon2id
    });
    return hashed;
}

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {

    if (req.session.userId) {
        console.log(req.session.userId + " is authenticated");
        next(); // Proceed if authenticated
    } else {
        res.status(401).send('Unauthorized');
    }
}

router.get('/me', ensureAuthenticated, async (req, res) => {

    const user = await db.select().from(users).where(eq(users.id, req.session.userId!)).execute();
    if (user.length == 0) {
        res.status(404).json({
            message: "user not found"
        })
        return;
    }
    res.status(200).json({
        username: user[0].username,
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
})

router.post('/login', async (req, res) => {

    const email = req.body.email;
    const user = await db.select().from(users).where(eq(users.email, email)).execute();
    if (user.length == 0) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    // passsword check
    try {
        if (await argon2.verify(user[0].password!, req.body.password)) {
            req.session.userId = user[0].id;
            res.status(200).json({
                userName: user[0].username
            })
        } else {
            res.status(401).json({
                message: "Invalid password"
            })
        }
    } catch {
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

router.post('/register', async (req, res) => {

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const serverCheck = (
        (name.length < 3 || name.length > 12) ||
        (email.length < 4 || email.length > 50 || email.indexOf('@') === -1 || email.indexOf('.') === -1)  ||
        (password.length < 8 || password.length > 20)
    );
    if (serverCheck) {
        res.status(400).json({
            message: "Invalid input"
        })
        return;
    }

    // check if user already exists through email
    const existing = await db.select().from(users).where(eq(users.email, email)).execute();
    if (existing.length > 0) {
        res.status(400).json({
            message: "User already exists"
        })
        return;
    }
    
    // register user
    const hashed = hashPassword(req.body.password);
    db.insert(users).values({
        username: req.body.name,
        email: req.body.email,
        password: await hashed,
    }).execute();

    // login user by setting userid
    const user = await db.select().from(users).where(eq(users.email, email)).execute();
    req.session.userId = user[0].id;
    res.status(200).json({
        username: name,
    })
})

export default router;