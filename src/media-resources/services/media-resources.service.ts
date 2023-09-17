import { Injectable } from '@nestjs/common';
import { MediaResourceRepository } from 'src/domain/repositories/media-resource.repository';
import { MediaResourceManager } from '../managers/media-resource.manager';
import { PostResource } from '../resources/post.resource';

@Injectable()
export class MediaResourcesService {
  public readonly posts: PostResource;

  constructor(
    private readonly resourceManager: MediaResourceManager,
    private readonly mediaRepo: MediaResourceRepository,
  ) {
    this.posts = new PostResource(this.resourceManager, this.mediaRepo);
  }
}
