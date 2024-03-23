export interface PostData {
    id: number;
    title: string;
    body: string;
    link: string;
    image: string;
    created_at: Date;
    likes: number;
    author: string;
    authorid: number;
    isLiked: boolean;
    authorFollowed: boolean;
}