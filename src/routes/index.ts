// main router
import { Router } from "express";
import authRouter from './auth';
import { posts, users } from "../models/schema";
import { db } from "../index";
import client from "../config/drizzle";
import { DashboardRow, PostData } from "../utils/types";
import { 
        FETCH_POSTS, 
        FETCH_POSTS_SEARCH,
        FETCH_SELF_POSTS, 
        FETCH_LIKED_POSTS, 
        SET_USER_FOLLOWS, 
        DELETE_USER_FOLLOWS, 
        FETCH_FOLLOWER_INFO, 
        FETCH_FOLLOWING_INFO, 
        FETCH_LIKE_INFO,
        FETCH_POSTS_SORT_LIKE} from "../utils/queries";
import { actionLimiter, deleteLimiter, ensureAuthenticated, feedLimiter, postLimiter, verifyPostUser } from "../utils/helper";

const router = Router();

router.get('/user', feedLimiter, ensureAuthenticated, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 4;
    const page = parseInt(req.query.page as string) || 1;
    const id = parseInt(req.query.userid as string);
    const offset = (page - 1) * limit;
    const userid = req.session.userId;

    try {
        const results = await client.query(FETCH_SELF_POSTS, [limit, offset, id]);

        let posts: PostData[] = new Array();
        results.rows.forEach(async element => {
            const isLiked = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
                `;
            const liked = (await client.query(isLiked, [userid, element.id])).rows.length > 0;
            const isFollowedQuery = `
                SELECT * FROM user_follows
                WHERE followerid = $1 AND followingid = $2;
            `;
            const followed = (await client.query(isFollowedQuery, [userid, element.userid])).rows.length > 0;
            const p: PostData = {
                id : element.id,
                title : element.title,
                body : element.body,
                link : element.link,
                image : element.image,
                created_at : element.created_at,
                likes : element.number_of_likes,
                author: element.author,
                authorid: element.userid,
                isLiked: liked,
                authorFollowed: followed 
            }
            posts.push(p);
        });

        // console.log(posts)
        setTimeout(() => {
            res.status(200).json(posts)
        }, 100);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

router.get('/dashboard', feedLimiter, ensureAuthenticated, async (req, res) => {

    const limit = parseInt(req.query.limit as string) || 4;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const userid = req.session.userId;
    try {
        const followers = await client.query(FETCH_FOLLOWER_INFO, [userid, limit, offset]);
        const following = await client.query(FETCH_FOLLOWING_INFO, [userid, limit, offset]);
        const likes = await client.query(FETCH_LIKE_INFO, [userid, limit, offset]);

        let dashboard: DashboardRow[] = new Array();
        const max = Math.max(followers.rows.length, following.rows.length, likes.rows.length);
        for (let i = 0; i < max; i++) {
            dashboard.push(
                {
                    follower: followers.rows[i]?.username || null,
                    followerid: followers.rows[i]?.id || null,
                    following: following.rows[i]?.username || null,
                    followingid: following.rows[i]?.id || null,
                    likeuser: likes.rows[i]?.username || null,
                    likeuserid: likes.rows[i]?.id || null,
                    likeposttitle: likes.rows[i]?.title || null,
                    timestamp: likes.rows[i]?.created_at || null
                }
            )
        }
        setTimeout(() => {
            res.status(200).json(dashboard)
        }, 100);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

router.get('/follow', actionLimiter, ensureAuthenticated, async (req, res) => {
    const authorid = parseInt(req.query.authorid as string);
    const userid = req.session.userId;

    try {
        if (authorid && userid){
            const isFollowedQuery = `
                SELECT * FROM user_follows
                WHERE followerid = $1 AND followingid = $2;
            `;
            if ((await client.query(isFollowedQuery, [userid, authorid])).rows.length > 0) {
                // unfollow
                try {
                    await client.query(DELETE_USER_FOLLOWS, [userid, authorid]);
                } catch (err) {
                    console.error(err);
                    res.status(500).json({
                        message: "Internal server error"
                    })
                }
                res.status(200).json({
                    message: "Unfollowed"
                });
                return;
            } else {
                // follow
                const insertFollow = `
                    INSERT INTO user_follows (followerid, followingid)
                    VALUES ($1, $2);
                `;
                try {
                    await client.query(SET_USER_FOLLOWS, [userid, authorid]);
                } catch (err) {
                    console.error(err);
                    res.status(500).json({
                        message: "Internal server error"
                    })
                }
                res.status(200).json({
                    message: "Followed"
                });
                return;
            }
        }

        res.status(400).json({
            message: "Invalid input"
        });
    } catch {
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

router.get('/like', actionLimiter, ensureAuthenticated, async (req, res) => {
    const postid = parseInt(req.query.postid as string);
    const userid = req.session.userId;

    try {
        if (postid && userid) {
            const isLikedQuery = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
            `;
            if ((await client.query(isLikedQuery, [userid, postid])).rows.length > 0) {
                // dislike
                const deleteLike = `
                    DELETE FROM likes
                    WHERE userid = $1 AND postid = $2;
                `;
                const updatePostLike = `
                    UPDATE posts
                    SET number_of_likes = number_of_likes - 1
                    WHERE id = $1;
                `;
                const getNumberOfLikes = `
                    SELECT number_of_likes FROM posts WHERE id = $1;
                `;
                await client.query(deleteLike, [userid, postid]);
                await client.query(updatePostLike, [postid]);
                const likes = await client.query(getNumberOfLikes, [postid]);
                console.log("Post disliked")
                res.status(200).json({
                    message: "Post disliked",
                    likes: likes.rows[0].number_of_likes,
                    liked: false 
                });
                return;
            } else {
                // like
                const insertLike = `
                    INSERT INTO likes (userid, postid)
                    VALUES ($1, $2);
                `;
                const updatePostLike = `
                    UPDATE posts
                    SET number_of_likes = number_of_likes + 1
                    WHERE id = $1;
                `;
                const getNumberOfLikes = `
                    SELECT number_of_likes FROM posts WHERE id = $1;
                `;
                await client.query(insertLike, [userid, postid]);
                await client.query(updatePostLike, [postid]);
                const likes: any = await client.query(getNumberOfLikes, [postid]);
                console.log("Post liked")
                res.status(200).json({
                    message: "Post liked",
                    likes: likes.rows[0].number_of_likes,
                    liked: true
                });
                return;
            }
        } 
        res.status(400).json({
            message: "Invalid input"
        });
    } catch {
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

router.get('/delete', deleteLimiter, ensureAuthenticated, async (req, res) => {

    const id = parseInt(req.query.id as string);
    const userid = req.session.userId;

    try {
        if (id && userid) {
            const user = await client.query(`SELECT * FROM users WHERE id = $1`, [userid]);
            if (user.rows[0].is_op == 1) {
                const ref = await client.query(`SELECT * FROM posts WHERE id = $1`, [id]);

                const deleteLikes = `
                    DELETE FROM likes
                    WHERE postid = $1;
                `;
                await client.query(deleteLikes, [id]);
                const query = `
                    DELETE FROM posts
                    WHERE id = $1;
                `;
                await client.query(query, [id]);
                res.status(200).json({
                    message: "Post deleted by op",
                    image: ref.rows[0].image
                });
                return;
            }

            const data = await verifyPostUser(client, userid, id);
            if (data.rows.length > 0) {
                const deleteLikes = `
                    DELETE FROM likes
                    WHERE postid = $1;
                `;
                await client.query(deleteLikes, [id]);
                const query = `
                    DELETE FROM posts
                    WHERE id = $1;
                `;
                await client.query(query, [id]);
                res.status(200).json({
                    message: "Post deleted",
                    image: data.rows[0].image
                });
                return;
            }
        }

        res.status(400).json({
            message: "Invalid input"
        });
    } catch {
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

router.get('/likedposts', feedLimiter, ensureAuthenticated, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 4;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const userid = req.session.userId;
    try {
        const results = await client.query(FETCH_LIKED_POSTS, [userid, limit, offset]);

        let posts: PostData[] = new Array();
        results.rows.forEach(async element => {
            const isLiked = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
                `;
            const liked = (await client.query(isLiked, [userid, element.id])).rows.length > 0;
            const isFollowedQuery = `
                SELECT * FROM user_follows
                WHERE followerid = $1 AND followingid = $2;
            `;
            const followed = (await client.query(isFollowedQuery, [userid, element.userid])).rows.length > 0;
            const p: PostData = {
                id : element.id,
                title : element.title,
                body : element.body,
                link : element.link,
                image : element.image,
                created_at : element.created_at,
                likes : element.number_of_likes,
                author: element.author,
                authorid: element.userid,
                isLiked: liked,
                authorFollowed: followed
            }
            posts.push(p);
        });

        // console.log(posts)
        setTimeout(() => {
            res.status(200).json(posts)
        }, 100);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

router.get('/self', feedLimiter, ensureAuthenticated, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 4;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const userid = req.session.userId;
    try {
        const results = await client.query(FETCH_SELF_POSTS, [limit, offset, userid!]);

        let posts: PostData[] = new Array();
        results.rows.forEach(async element => {
            const isLiked = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
                `;
            const liked = (await client.query(isLiked, [userid, element.id])).rows.length > 0;
            const isFollowedQuery = `
                SELECT * FROM user_follows
                WHERE followerid = $1 AND followingid = $2;
            `;
            const followed = (await client.query(isFollowedQuery, [userid, element.userid])).rows.length > 0;
            const p: PostData = {
                id : element.id,
                title : element.title,
                body : element.body,
                link : element.link,
                image : element.image,
                created_at : element.created_at,
                likes : element.number_of_likes,
                author: element.author,
                authorid: element.userid,
                isLiked: liked,
                authorFollowed: followed
            }
            posts.push(p);
        });

        // console.log(posts)
        setTimeout(() => {
            res.status(200).json(posts)
        }, 100);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

router.get('/feed', feedLimiter, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 4;
    const page = parseInt(req.query.page as string) || 1;
    const search = (req.query.search as string).split(/\s+/).join(' | ') || "";
    const sort = (req.query.sort as string) || "";
    const offset = (page - 1) * limit;
    const userid = req.session.userId;

    try {
        let results;
        if (search){
            results = await client.query(FETCH_POSTS_SEARCH, [limit, offset, search]);
        } else {
            if (sort == "like"){
                results = await client.query(FETCH_POSTS_SORT_LIKE, [limit, offset]);
            } else {
                results = await client.query(FETCH_POSTS, [limit, offset]);
            }
        }

        let posts: PostData[] = new Array();
        results.rows.forEach(async element => {
            const isLiked = `
                SELECT * FROM likes
                WHERE userid = $1 AND postid = $2;
                `;
            const liked = (await client.query(isLiked, [userid, element.id])).rows.length > 0;
            const isFollowedQuery = `
                SELECT * FROM user_follows
                WHERE followerid = $1 AND followingid = $2;
            `;
            const followed = (await client.query(isFollowedQuery, [userid, element.userid])).rows.length > 0;
            const p: PostData = {
                id : element.id,
                title : element.title,
                body : element.body,
                link : element.link,
                image : element.image,
                created_at : element.created_at,
                likes : element.number_of_likes,
                author: element.author,
                authorid: element.userid,
                isLiked: liked,
                authorFollowed: followed 
            }
            posts.push(p);
        });

        // console.log(posts)
        setTimeout(() => {
            res.status(200).json(posts)
        }, 100);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

router.post('/post', postLimiter, ensureAuthenticated, async (req, res) => {

    // todo: on post, index vocabularies
    const check_Postcount_query = `
        SELECT * FROM posts
        WHERE userid = $1;
    `;

    try {
        // a account can only have 20 posts maximum for now
        if ((await client.query(check_Postcount_query, [req.session.userId])).rows.length > 20) {
            console.log("Post limit reached")
            res.status(400).json({
                message: "Post limit reached"
            })
            return;
        }

        const { title, summary, link, type} = req.body;
        
        const serverCheck = (
            (title.length < 1 || title.length > 80) ||
            (summary.length < 1 || summary.length > 5000) ||
            (link.length > 200)
        );

        if (serverCheck) {
            res.status(400).json({
                message: "Invalid input"
            })
            return;
        }

        const userId = req.session.userId!;
        const image_postgres = "https://rsdev.s3.amazonaws.com/" + userId.toString() + "_" + new Date().getTime().toString() + "." + type;
        const image_s3 = userId.toString() + "_" + new Date().getTime().toString() + "." + type;

        // insertion operation
        if (req.session.userId) {
            await db.insert(posts).values({
                userid : userId,
                title: title,
                body: summary,
                link: link,
                image: image_postgres 
            }).execute();
        } else {
            res.status(500).json({
                message: "session userid not found"
            })
        }

        res.status(200).json({
            message: "Post successful",
            url: image_s3 
        });
    } catch {
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

router.use('/auth', authRouter);

export default router;