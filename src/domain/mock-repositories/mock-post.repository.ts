import { generateTimestampId } from 'src/utils/util-functions';
import { PostRepository } from '../repositories/post.repository';
import { Post, PostContent } from '../schemas/post.schema';

export const mockPost = (): Post => {
  const post = new Post();
  post.id = 'id';
  return post;
};

export const MockPostRepository: PostRepository = {
  instance: jest.fn((data?: Partial<Post>) => {
    const post = new Post();
    if (data) Object.assign(post, data);
    post.id = generateTimestampId();

    return post;
  }),

  contentInstance: jest.fn((data?: Partial<PostContent>) => {
    const content = new PostContent();
    if (data) Object.assign(content, data);
    content.id = generateTimestampId();

    return content;
  }),

  create: jest.fn((post: Post) => {
    return Promise.resolve(post);
  }),

  save: jest.fn((post: Post) => {
    return Promise.resolve(post);
  }),

  deleteById: jest.fn().mockResolvedValue(true),

  findById: jest.fn().mockResolvedValue(mockPost()),

  find: jest.fn().mockResolvedValue([mockPost()]),
};
