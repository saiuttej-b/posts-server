import { Post, PostContent } from '../schemas/post.schema';

export abstract class PostRepository {
  abstract instance(data?: Partial<Post>): Post;

  abstract contentInstance(data?: Partial<PostContent>): PostContent;

  abstract create(post: Post): Promise<Post>;

  abstract save(post: Post): Promise<Post>;

  abstract deleteById(id: string): Promise<void>;

  abstract findById(id: string): Promise<Post>;

  abstract find(): Promise<Post[]>;
}
