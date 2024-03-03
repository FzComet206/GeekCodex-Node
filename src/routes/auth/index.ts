// copilot keys: alt + ], ctrl + enter, ctrl + -> <-  and generating code using comments
import { Router } from "express";
import argon2, { hash } from "argon2";
import { Session } from "express-session";
import client from "../../config/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { users, Users} from "../../models/schema";
import { eq } from "drizzle-orm";

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
    const db = await drizzle(client);

    const user = await db.select().from(users).where(eq(users.email, req.body.email)).execute();
    if (user.length > 0) {
        res.status(404).json({
            text: "user already exists"
        })
    } else {
        await db.insert(users).values({
            username: req.body.name,
            email: req.body.email,
            password: await hashPassword(req.body.password),
        }).execute();

        res.json({
            text: "server register action"
        });
        (req.session as CustomSession).userId = user[0].id;
        (req.session as CustomSession).name = user[0].username || "undefined user";
    }
})

export default router;