import { Post, PostContent } from '../schemas/post.schema';

export type FindPostsProps = {
  search?: string;
  limit?: number;
  skip?: number;
};

export abstract class PostRepository {
  abstract instance(data?: Partial<Post>): Post;

  abstract contentInstance(data?: Partial<PostContent>): PostContent;

  abstract create(post: Post): Promise<Post>;

  abstract save(post: Post): Promise<Post>;

  abstract deleteById(id: string): Promise<void>;

  abstract findById(id: string): Promise<Post>;

  abstract find(query: FindPostsProps): Promise<{
    count: number;
    posts: Post[];
  }>;
}
