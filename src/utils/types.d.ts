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

export interface DashboardRow {
  follower: string;
  followerid: string;
  following: string;
  followingid: string;
  likeuser: string;
  likeuserid: string;
  likeposttitle: string;
  timestamp: string;
}