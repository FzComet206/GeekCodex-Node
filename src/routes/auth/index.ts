// copilot keys: alt + ], ctrl + enter, ctrl + -> <-  and generating code using comments
import { Router } from "express";
import { users } from "../../models/schema";
import { eq } from "drizzle-orm";
import { db } from "../../index";
import { hashPassword, verifyPassword, ensureAuthenticated, sendResetSES, authLimiter, feedLimiter, sendVerifySES, emailLimiter, loginLimiter } from "../../utils/helper";
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from "../../middlewares/createApp";

const router = Router();

router.post('/resetpassword', authLimiter, async (req, res) => {
    const token = req.body.token;
    const password = req.body.password;
    const email = await redisClient.get(`reset:${token}`);
    if (email) {
        // reset password
        try {
            const hashed = await hashPassword(password);
            db.update(users).set({ password: hashed }).where(eq(users.email, email)).execute();
            await redisClient.del(`reset:${token}`);
            await redisClient.del(`reset:${email}`);
            res.status(200).json({
                message: "Password reset"
            })
        } catch (e) {
            res.status(500).json({
                message: "Internal server error"
            })
        }

    } else {
        res.status(404).json({
            message: "Token not found"
        })
    }
})

router.post('/changepassword', emailLimiter, async (req, res) => {
    const email = req.body.email;

    const user = await db.select().from(users).where(eq(users.email, email)).execute();
    if (user.length == 0) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    if (await redisClient.get(`reset:${email}`)){
        console.log("password reset already sent")
        res.status(429).json({
            message: "Password reset already sent"
        })
        return;
    }

    // passsword check
    try {

        // generate uuid token
        const token = uuidv4();
        const url = process.env.ORIGIN + `/auth/resetpassword/${token}`
        // store token in redis
        redisClient.set(`reset:${token}`, email, 'EX', 60 * 15)
        redisClient.set(`reset:${email}`, token, 'EX', 60 * 15)

        // send email with token
        await sendResetSES(email, url)
        res.status(200).json({
            message: "Password change request"
        })
    } catch (e) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

router.get('/me', feedLimiter, ensureAuthenticated, async (req, res) => {

    try {
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
    } catch (e)
    {
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

router.post('/login', loginLimiter, async (req, res) => {

    const email = req.body.email;

    try {
        const user = await db.select().from(users).where(eq(users.email, email)).execute();
        if (user.length == 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }
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
    } catch {
        res.status(500).json({
            message: "Internal server error"
        })
    }

    // passsword check
})

router.post('/logout', authLimiter, async (req, res) => {

    try {
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
    } catch {
        res.status(500).json({
            message: "Internal server error"
        })
    }
    
})


router.post('/register', emailLimiter, async (req, res) => {

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

    if (await redisClient.get(`verify:${email}`)){
        console.log("verify already sent")
        res.status(429).json({
            message: "Verify already sent"
        })
        return;
    }

    try {
        // check if user already exists through email
        const existing = await db.select().from(users).where(eq(users.email, email)).execute();
        if (existing.length > 0) {
            res.status(401).json({
                message: "User already exists"
            })
            return;
        }
        
        // register user
        const hashed = await hashPassword(req.body.password);
        const token = uuidv4();
        await redisClient.set(`verify_username:${token}`, req.body.name, 'EX', 60 * 15);
        await redisClient.set(`verify_email:${token}`, req.body.email, 'EX', 60 * 15);
        await redisClient.set(`verify_hash:${token}`, hashed, 'EX', 60 * 15);
        await redisClient.set(`verify:${email}`, token, 'EX', 60 * 15);

        console.log("server register")

        const url = process.env.ORIGIN + `/auth/verify/${token}`
        await sendVerifySES(email, url)
        res.status(200).json({
            message: "Password change request"
        })

    } catch (e) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

router.post('/verify', authLimiter, async (req, res) => {
    const token = req.body.token;
    const username = await redisClient.get(`verify_username:${token}`);
    const email = await redisClient.get(`verify_email:${token}`);
    const password = await redisClient.get(`verify_hash:${token}`);

    if (!username || !email || !password) {
        res.status(404).json({
            message: "Token not found"
        })
        return;
    }

    try {
        console.log("server verify")
        await redisClient.del(`verify_username:${token}`);
        await redisClient.del(`verify_email:${token}`);
        await redisClient.del(`verify_hash:${token}`);
        await redisClient.del(`verify:${email}`);


        db.insert(users).values({
            username: username,
            email: email,
            password: password
        }).execute();

        const user = await db.select().from(users).where(eq(users.email, email)).execute();
        req.session.userId = user[0].id;
        res.status(200).json({
            username: user[0].username
        })
                
    } catch {
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

export default router;