import { Test } from '@nestjs/testing';
import { mockMediaResource } from 'src/domain/mock-repositories/mock-media-resource.repository';
import { mockPost } from 'src/domain/mock-repositories/mock-post.repository';
import { MediaResource } from 'src/domain/schemas/media-resource.schema';
import { Post, PostContentTypes } from 'src/domain/schemas/post.schema';
import { PostsController } from '../controllers/posts.controller';
import { PostCreateDto } from '../dtos/posts.dto';
import { PostsService } from '../services/posts.service';

describe('PostsController', () => {
  const mockPostsService: Partial<PostsService> = {
    uploadCoverFile: jest.fn(),
    uploadResource: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    getPosts: jest.fn(),
    getPost: jest.fn(),
  };

  let postsController: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
      controllers: [PostsController],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    postsController = module.get<PostsController>(PostsController);

    jest.clearAllMocks();
  });

  const reqBody: PostCreateDto = {
    title: 'title',
    shortDescription: 'shortDescription',
    coverFileKey: 'coverFileKey',
    content: [
      {
        type: PostContentTypes.TEXT,
        text: 'text',
      },
      {
        type: PostContentTypes.RESOURCES,
        resourceKeys: ['resourceKey1', 'resourceKey2'],
      },
    ],
  };

  describe('uploadCoverFile', () => {
    let result: MediaResource;
    const file = {} as Express.Multer.File;

    beforeEach(async () => {
      jest.spyOn(postsService, 'uploadCoverFile').mockResolvedValue(mockMediaResource());

      result = await postsController.uploadCoverFile(file);
    });

    it('should call service.uploadCoverFile', async () => {
      expect(postsService.uploadCoverFile).toHaveBeenCalledWith(file);
    });

    it('should return the result from service.uploadCoverFile', async () => {
      expect(result).toEqual(mockMediaResource());
    });
  });

  describe('uploadResource', () => {
    let result: MediaResource;
    const file = {} as Express.Multer.File;

    beforeEach(async () => {
      jest.spyOn(postsService, 'uploadResource').mockResolvedValue(mockMediaResource());

      result = await postsController.uploadResource(file);
    });

    it('should call service.uploadResource', async () => {
      expect(postsService.uploadResource).toHaveBeenCalledWith(file);
    });

    it('should return the result from service.uploadResource', async () => {
      expect(result).toEqual(mockMediaResource());
    });
  });

  describe('createPost', () => {
    let result: Post;

    beforeEach(async () => {
      jest.spyOn(postsService, 'createPost').mockResolvedValue(mockPost());

      result = await postsController.createPost(reqBody);
    });

    it('should call service.createPost', async () => {
      expect(postsService.createPost).toHaveBeenCalledWith(reqBody);
    });

    it('should return the result from service.createPost', async () => {
      expect(result).toEqual(mockPost());
    });
  });

  describe('updatePost', () => {
    let result: Post;

    beforeEach(async () => {
      jest.spyOn(postsService, 'updatePost').mockResolvedValue(mockPost());

      result = await postsController.updatePost(reqBody, mockPost().id);
    });

    it('should call service.updatePost', async () => {
      expect(postsService.updatePost).toHaveBeenCalledWith(mockPost().id, reqBody);
    });

    it('should return the result from service.updatePost', async () => {
      expect(result).toEqual(mockPost());
    });
  });

  describe('deletePost', () => {
    beforeEach(async () => {
      jest.spyOn(postsService, 'deletePost').mockResolvedValue({
        success: true,
        message: 'message',
      });

      await postsController.deletePost(mockPost().id);
    });

    it('should call service.deletePost', async () => {
      expect(postsService.deletePost).toHaveBeenCalledWith(mockPost().id);
    });
  });

  describe('getPosts', () => {
    let result: { posts: Post[]; count: number };

    beforeEach(async () => {
      jest.spyOn(postsService, 'getPosts').mockResolvedValue({
        posts: [mockPost()],
        count: 1,
      });

      result = await postsController.getPosts({});
    });

    it('should call service.getPosts', async () => {
      expect(postsService.getPosts).toHaveBeenCalledWith({});
    });

    it('should return the result from service.getPosts', async () => {
      expect(result).toMatchObject({
        posts: [mockPost()],
        count: 1,
      });
    });
  });

  describe('getPost', () => {
    let result: Post;

    beforeEach(async () => {
      jest.spyOn(postsService, 'getPost').mockResolvedValue({
        post: mockPost(),
      });

      const value = await postsController.getPost(mockPost().id);
      result = value.post;
    });

    it('should call service.getPost', async () => {
      expect(postsService.getPost).toHaveBeenCalledWith(mockPost().id);
    });

    it('should return the result from service.getPost', async () => {
      expect(result).toEqual(mockPost());
    });
  });
});
