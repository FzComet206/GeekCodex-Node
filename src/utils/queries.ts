export const FETCH_SELF_POSTS = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        WHERE posts.userid = $3
        ORDER BY posts.created_at DESC
        LIMIT $1 OFFSET $2;
    `;

export const FETCH_POSTS = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        ORDER BY posts.created_at DESC
        LIMIT $1 OFFSET $2;
    `;

export const FETCH_LIKED_POSTS = `
        SELECT posts.* , users.username AS author 
        FROM posts
        JOIN users ON posts.userid = users.id
        JOIN likes ON posts.id = likes.postid
        WHERE likes.userid = $1
        ORDER BY posts.created_at DESC
        LIMIT $2 OFFSET $3;
    `;

export const DELETE_USER_FOLLOWS = `
        DELETE FROM user_follows
        WHERE followerid = $1 AND followingid = $2;
    `;

export const SET_USER_FOLLOWS = `
        INSERT INTO user_follows (followerid, followingid)
        VALUES ($1, $2);
    `;