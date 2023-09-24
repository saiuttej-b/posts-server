import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { generateTimestampId } from 'src/utils/util-functions';
import { FindPostsProps, PostRepository } from '../repositories/post.repository';
import { Post, PostContent, PostDocument } from '../schemas/post.schema';

@Injectable()
export class MongoDBPostRepository implements PostRepository {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<Post>) {}

  instance(data?: Partial<Post>): Post {
    const post = new Post();
    if (data) Object.assign(post, data);
    if (!post.id) post.id = generateTimestampId();

    post.content = [];
    return post;
  }

  contentInstance(data?: Partial<PostContent>): PostContent {
    const content = new PostContent();
    if (data) Object.assign(content, data);
    if (!content.id) content.id = generateTimestampId();

    return content;
  }

  async create(post: Post): Promise<Post> {
    if (!post.id) post.id = generateTimestampId();
    post.content.forEach((content) => {
      if (!content.id) content.id = generateTimestampId();
    });

    const record = await this.postModel.create(post);
    return this.convert(record);
  }

  async save(post: Post): Promise<Post> {
    if (!post.id) return this.create(post);

    const previous = await this.postModel.findOne({ id: post.id }).exec();
    if (!previous) return this.create(post);

    Object.assign(previous, post);
    if (!previous.isModified()) return post;

    const record = await previous.save();
    return this.convert(record);
  }

  async deleteById(id: string): Promise<void> {
    await this.postModel.deleteOne({ id }).exec();
  }

  async findById(id: string): Promise<Post> {
    const record = await this.postModel.findOne({ id }).exec();
    return this.convert(record);
  }

  async find(query: FindPostsProps): Promise<{
    count: number;
    posts: Post[];
  }> {
    const filter: FilterQuery<Post> = {
      ...(query.search && {
        $or: [
          { title: { $regex: query.search, $options: 'i' } },
          { shortDescription: { $regex: query.search, $options: 'i' } },
        ],
      }),
    };

    query.limit = query.limit || Number.MAX_SAFE_INTEGER;
    query.skip = query.skip || 0;

    const [count, records] = await Promise.all([
      this.postModel.countDocuments(filter).exec(),
      this.postModel.find(filter).sort({ id: -1 }).skip(query.skip).limit(query.limit).exec(),
    ]);

    return {
      count,
      posts: this.convert(records),
    };
  }

  private convert(value: PostDocument): Post;
  private convert(value: PostDocument[]): Post[];
  private convert(value: PostDocument | PostDocument[]): Post | Post[] {
    if (!value) return;
    if (Array.isArray(value)) return value.map((v) => this.convert(v));

    const post = new Post();
    Object.assign(post, value.toJSON());

    delete post['_id'];
    delete post['__v'];
    return post;
  }
}
