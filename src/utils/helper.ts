import { Request, Response, NextFunction } from "express";
import argon2 from "argon2";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import rateLimit from "express-rate-limit";

export const deleteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 60, // limit each IP to 6 requests per windowMs
});

export const postLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 6, // limit each IP to 6 requests per windowMs
});

// used for all auth operations
export const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 12, // limit each IP to 6 requests per windowMs
});

// used for all feed and me operations
export const feedLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 120, // limit each IP to 120 requests per windowMs
});

export const actionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 60, // limit each IP to 6 requests per windowMs
});

export const sendResetSES = async (to: string, url: string) => {

    const client = new SESClient({ 
        region: process.env.SES_REGION!,
        credentials: {
            accessKeyId: process.env.SES_KEY!,
            secretAccessKey: process.env.SES_SECRET!
        }
    });

    const input = {
        "Destination": {
            "ToAddresses": [
                `${to}`
            ]
        },
        "Message": {
            "Body": {
            "Html": {
                "Charset": "UTF-8",
                "Data": `click the following link to reset your password: ${url}`
            },
            "Text": {
                "Charset": "UTF-8",
                "Data": "This is the message body in text format."
            }
            },
            "Subject": {
            "Charset": "UTF-8",
            "Data": "Password reset for you GeekCodex account"
            }
        },
        "Source": "GeekCodex@geekcodex.org",
    };

    const command = new SendEmailCommand(input);
    console.log("Sending email to " + to);
    return await client.send(command);
}

export const verifyPostUser = async (client:any, userid: number, postid: number) => {

    const query = `
        SELECT * FROM posts
        WHERE userid = $1 AND id = $2;
    `;
    return await client.query(query, [userid, postid]);
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {

    if (req.session.userId) {
        console.log(req.session.userId + " is authenticated");
        next(); // Proceed if authenticated
    } else {
        res.status(401).send('Unauthorized');
    }
}

export const hashPassword = async (password: string) => {
    const hashed = await argon2.hash(password, {
        type: argon2.argon2id
    });
    return hashed;
}

export const verifyPassword = async (hashedPassword: string, password: string) => {
    return await argon2.verify(hashedPassword, password);
}

