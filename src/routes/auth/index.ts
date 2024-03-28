// copilot keys: alt + ], ctrl + enter, ctrl + -> <-  and generating code using comments
import { Router } from "express";
import { users } from "../../models/schema";
import { eq } from "drizzle-orm";
import { db } from "../../index";
import { hashPassword, verifyPassword, ensureAuthenticated, sendResetSES, authLimiter, feedLimiter } from "../../utils/helper";
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from "../../middlewares/createApp";

const router = Router();

router.post('/changepassword', authLimiter, async (req, res) => {
    const email = req.body.email;
    const user = await db.select().from(users).where(eq(users.email, email)).execute();
    if (user.length == 0) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    // passsword check
    try {

        // generate uuid token
        const token = uuidv4();
        // store token in redis
        redisClient.set(`reset:${token}`, email, 'EX', 60 * 15)
        // send email with token
        const ses_response = await sendResetSES(email, token)
        console.log(ses_response)


        res.status(200).json({
            message: "Password change request"
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

router.get('/me', feedLimiter, ensureAuthenticated, async (req, res) => {

    const user = await db.select().from(users).where(eq(users.id, req.session.userId!)).execute();
    if (user.length == 0) {
        res.status(404).json({
            message: "user not found"
        })
        return;
    }

    res.status(200).json({
        is_op: user[0].isop,
        username: user[0].username,
    })

})

router.post('/login', authLimiter, async (req, res) => {

    const email = req.body.email;
    const user = await db.select().from(users).where(eq(users.email, email)).execute();
    console.log(req.body)
    if (user.length == 0) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    // passsword check
    try {
        if (await verifyPassword(user[0].password!, req.body.password)) {
            req.session.userId = user[0].id;
            res.status(200).json({
                username: user[0].username
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

router.post('/logout', authLimiter, async (req, res) => {
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


router.post('/register', authLimiter, async (req, res) => {

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
        res.status(401).json({
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