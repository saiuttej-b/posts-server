import { Injectable, NotFoundException } from '@nestjs/common';
import { keyBy } from 'lodash';
import { PostRepository } from 'src/domain/repositories/post.repository';
import { PostContentTypes } from 'src/domain/schemas/post.schema';
import { MediaResourcesService } from 'src/media-resources/services/media-resources.service';
import { GetPostsDto, PostCreateDto } from '../dtos/posts.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly mediaResourceService: MediaResourcesService,
  ) {}

  uploadCoverFile(file: Express.Multer.File) {
    return this.mediaResourceService.posts.uploadCoverFile({ file });
  }

  uploadResource(file: Express.Multer.File) {
    return this.mediaResourceService.posts.uploadResource({ file });
  }

  async createPost(reqBody: PostCreateDto) {
    const post = this.postRepo.instance();
    post.title = reqBody.title;
    post.shortDescription = reqBody.shortDescription;

    const postFiles = await this.mediaResourceService.posts.updatePostFiles({
      typeId: post.id,
      coverFileKey: reqBody.coverFileKey,
      resourceFileKeys: reqBody.content
        .filter((c) => c.type === PostContentTypes.RESOURCES)
        .map((c) => c.resourceKeys)
        .flat(),
    });
    const fileMap = keyBy(postFiles.resources, (v) => v.key);

    post.resource = postFiles.coverFile;
    post.content = reqBody.content.map((c) => {
      const content = this.postRepo.contentInstance();
      content.type = c.type;
      content.text = c.text;

      if (c.type === PostContentTypes.RESOURCES) {
        content.resources = c.resourceKeys.map((k) => fileMap[k]);
      }
      return content;
    });

    return this.postRepo.create(post);
  }

  async updatePost(id: string, reqBody: PostCreateDto) {
    const post = await this.postRepo.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.title = reqBody.title;
    post.shortDescription = reqBody.shortDescription;

    const postFiles = await this.mediaResourceService.posts.updatePostFiles({
      typeId: post.id,
      coverFileKey: reqBody.coverFileKey,
      resourceFileKeys: reqBody.content
        .filter((c) => c.type === PostContentTypes.RESOURCES)
        .map((c) => c.resourceKeys)
        .flat(),
    });
    const fileMap = keyBy(postFiles.resources, (v) => v.key);

    post.resource = postFiles.coverFile;
    post.content = reqBody.content.map((c) => {
      const content = this.postRepo.contentInstance();
      content.type = c.type;
      content.text = c.text;

      if (c.type === PostContentTypes.RESOURCES) {
        content.resources = c.resourceKeys.map((k) => fileMap[k]);
      }
      return content;
    });

    return this.postRepo.save(post);
  }

  async deletePost(id: string) {
    const post = await this.postRepo.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.mediaResourceService.posts.delete(id);
    await this.postRepo.deleteById(id);

    return {
      success: true,
      message: 'Post deleted successfully',
    };
  }

  async getPost(id: string) {
    const post = await this.postRepo.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      post: post,
    };
  }

  async getPosts(query: GetPostsDto) {
    const result = await this.postRepo.find(query);

    return {
      count: result.count,
      posts: result.posts,
    };
  }
}
