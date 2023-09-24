import { Test } from '@nestjs/testing';
import { MockPostRepository, mockPost } from 'src/domain/mock-repositories/mock-post.repository';
import { PostRepository } from 'src/domain/repositories/post.repository';
import { MediaResource } from 'src/domain/schemas/media-resource.schema';
import { Post, PostContentTypes } from 'src/domain/schemas/post.schema';
import { MediaResourcesService } from 'src/media-resources/services/media-resources.service';
import { PostCreateDto } from '../dtos/posts.dto';
import { PostsService } from '../services/posts.service';

describe('PostsService', () => {
  const mockMediaResourceService = {
    posts: {
      uploadCoverFile: jest.fn(),
      uploadResource: jest.fn(),
      updatePostFiles: jest.fn(),
      delete: jest.fn(),
    },
  };
  const mockPostRepo = {
    instance: jest.fn(),
    contentInstance: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteById: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
  };

  let postsService: PostsService;
  let postRepo: PostRepository;
  let mediaResourceService: MediaResourcesService;

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

  const coverFile = new MediaResource();
  coverFile.key = 'coverFileKey';

  const resources = reqBody.content[1].resourceKeys.map((k) => {
    const resource = new MediaResource();
    resource.key = k;
    return resource;
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostRepository,
          useValue: mockPostRepo,
        },
        {
          provide: MediaResourcesService,
          useValue: mockMediaResourceService,
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    postRepo = module.get<PostRepository>(PostRepository);
    mediaResourceService = module.get<MediaResourcesService>(MediaResourcesService);

    jest.clearAllMocks();
  });

  describe('uploadCoverFile', () => {
    it('should call mediaResourceService.posts.uploadCoverFile', () => {
      const spy = jest.spyOn(mediaResourceService.posts, 'uploadCoverFile');
      const file = {} as Express.Multer.File;
      postsService.uploadCoverFile(file);
      expect(spy).toHaveBeenCalledWith({ file });
    });

    it('should return the result of mediaResourceService.posts.uploadCoverFile', () => {
      const result = new MediaResource();
      jest.spyOn(mediaResourceService.posts, 'uploadCoverFile').mockResolvedValue(result);
      const file = {} as Express.Multer.File;
      expect(postsService.uploadCoverFile(file)).resolves.toBe(result);
    });
  });

  describe('uploadResource', () => {
    it('should call mediaResourceService.posts.uploadResource', () => {
      const spy = jest.spyOn(mediaResourceService.posts, 'uploadResource');
      const file = {} as Express.Multer.File;
      postsService.uploadResource(file);
      expect(spy).toHaveBeenCalledWith({ file });
    });

    it('should return the result of mediaResourceService.posts.uploadResource', () => {
      const result = new MediaResource();
      jest.spyOn(mediaResourceService.posts, 'uploadResource').mockResolvedValue(result);
      const file = {} as Express.Multer.File;
      expect(postsService.uploadResource(file)).resolves.toBe(result);
    });
  });

  describe('createPost', () => {
    describe('when post is created successfully', () => {
      let result: Post;
      beforeEach(async () => {
        jest.spyOn(postRepo, 'instance').mockImplementation(MockPostRepository.instance);
        jest
          .spyOn(postRepo, 'contentInstance')
          .mockImplementation(MockPostRepository.contentInstance);
        jest.spyOn(postRepo, 'create').mockImplementation(MockPostRepository.create);

        jest.spyOn(mediaResourceService.posts, 'updatePostFiles').mockResolvedValue({
          coverFile: coverFile,
          resources: resources,
        });

        result = await postsService.createPost(reqBody);
      });

      it('should call postRepo.instance', () => {
        expect(postRepo.instance).toHaveBeenCalled();
      });

      it('should call postRepo.contentInstance', () => {
        expect(postRepo.contentInstance).toHaveBeenCalled();
        expect(postRepo.contentInstance).toHaveBeenCalledTimes(2);
      });

      it('should call mediaResourceService.posts.updatePostFiles', () => {
        expect(mediaResourceService.posts.updatePostFiles).toHaveBeenCalledWith({
          typeId: expect.any(String),
          coverFileKey: reqBody.coverFileKey,
          resourceFileKeys: reqBody.content
            .filter((c) => c.type === PostContentTypes.RESOURCES)
            .map((c) => c.resourceKeys)
            .flat(),
        });
      });

      it('should call postRepo.create', () => {
        expect(postRepo.create).toHaveBeenCalledWith({
          id: expect.any(String),
          title: reqBody.title,
          shortDescription: reqBody.shortDescription,
          resource: expect.any(MediaResource),
          content: expect.any(Array),
        });
      });

      it('should return the created post', () => {
        expect(result).toEqual({
          id: expect.any(String),
          title: reqBody.title,
          shortDescription: reqBody.shortDescription,
          resource: expect.any(MediaResource),
          content: expect.any(Array),
        });

        expect(result.resource.key).toEqual('coverFileKey');

        expect(result.content.length).toEqual(2);
      });
    });
  });

  describe('updatePost', () => {
    let post: Post;
    const previousPost = mockPost();

    describe('when post is updated successfully', () => {
      beforeEach(async () => {
        jest.spyOn(postRepo, 'findById').mockResolvedValue(previousPost);
        jest
          .spyOn(postRepo, 'contentInstance')
          .mockImplementation(MockPostRepository.contentInstance);

        jest.spyOn(mediaResourceService.posts, 'updatePostFiles').mockResolvedValue({
          coverFile: coverFile,
          resources: resources,
        });

        jest.spyOn(postRepo, 'save').mockImplementation(MockPostRepository.save);

        post = await postsService.updatePost(previousPost.id, reqBody);
      });

      it('should call postRepo.findById', () => {
        expect(postRepo.findById).toHaveBeenCalledWith(previousPost.id);
      });

      it('should call postRepo.contentInstance', () => {
        expect(postRepo.contentInstance).toHaveBeenCalled();
        expect(postRepo.contentInstance).toHaveBeenCalledTimes(2);
      });

      it('should call mediaResourceService.posts.updatePostFiles', () => {
        expect(mediaResourceService.posts.updatePostFiles).toHaveBeenCalledWith({
          typeId: expect.any(String),
          coverFileKey: reqBody.coverFileKey,
          resourceFileKeys: reqBody.content
            .filter((c) => c.type === PostContentTypes.RESOURCES)
            .map((c) => c.resourceKeys)
            .flat(),
        });
      });

      it('should call postRepo.save', () => {
        expect(postRepo.save).toHaveBeenCalledWith({
          id: expect.any(String),
          title: reqBody.title,
          shortDescription: reqBody.shortDescription,
          resource: expect.any(MediaResource),
          content: expect.any(Array),
        });
      });

      it('should return the updated post', () => {
        expect(post).toEqual({
          id: expect.any(String),
          title: reqBody.title,
          shortDescription: reqBody.shortDescription,
          resource: expect.any(MediaResource),
          content: expect.any(Array),
        });

        expect(post.id).toEqual(previousPost.id);

        expect(post.resource.key).toEqual('coverFileKey');

        expect(post.content.length).toEqual(2);
      });
    });

    describe('when post is not found', () => {
      beforeEach(async () => {
        jest.spyOn(postRepo, 'findById').mockResolvedValue(null);
      });

      it('should throw NotFoundException', () => {
        expect(postsService.updatePost(previousPost.id, reqBody)).rejects.toThrowError(
          'Post not found',
        );
      });
    });
  });

  describe('deletePost', () => {
    const previousPost = mockPost();

    describe('when post is deleted successfully', () => {
      beforeEach(async () => {
        jest.spyOn(postRepo, 'findById').mockResolvedValue(previousPost);
        jest.spyOn(postRepo, 'deleteById').mockResolvedValue();
        await postsService.deletePost(previousPost.id);
      });

      it('should call postRepo.findById', () => {
        expect(postRepo.findById).toHaveBeenCalledWith(previousPost.id);
      });

      it('should call postRepo.deleteById', () => {
        expect(postRepo.deleteById).toHaveBeenCalledWith(previousPost.id);
      });
    });

    describe('when post is not found', () => {
      beforeEach(async () => {
        jest.spyOn(postRepo, 'findById').mockResolvedValue(null);
      });

      it('should throw NotFoundException', () => {
        expect(postsService.deletePost(previousPost.id)).rejects.toThrowError('Post not found');
      });
    });
  });

  describe('getPost', () => {
    const previousPost = mockPost();

    describe('when post is found', () => {
      let result: { post: Post };
      beforeEach(async () => {
        jest.spyOn(postRepo, 'findById').mockResolvedValue(previousPost);
        result = await postsService.getPost(previousPost.id);
      });

      it('should call postRepo.findById', () => {
        expect(postRepo.findById).toHaveBeenCalledWith(previousPost.id);
      });

      it('should return the post', async () => {
        expect(result).toEqual({
          post: previousPost,
        });
      });
    });

    describe('when post is not found', () => {
      beforeEach(async () => {
        jest.spyOn(postRepo, 'findById').mockResolvedValue(null);
      });

      it('should throw NotFoundException', () => {
        expect(postsService.getPost(previousPost.id)).rejects.toThrowError('Post not found');
      });
    });
  });

  describe('getPosts', () => {
    const previousPost = mockPost();

    describe('when posts are found', () => {
      let result: { posts: Post[]; count: number };
      beforeEach(async () => {
        jest.spyOn(postRepo, 'find').mockResolvedValue({ count: 1, posts: [previousPost] });
        result = await postsService.getPosts({});
      });

      it('should call postRepo.find', () => {
        expect(postRepo.find).toHaveBeenCalled();
      });

      it('should return the posts', async () => {
        expect(result).toMatchObject({
          posts: [previousPost],
          count: 1,
        });
      });
    });
  });
});
