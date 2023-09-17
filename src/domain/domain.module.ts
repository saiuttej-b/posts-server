import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBMediaResourceRepository } from './mongodb-repositories/mongodb-media-resource.repository';
import { MongoDBPostRepository } from './mongodb-repositories/mongodb-post.repository';
import { MediaResourceRepository } from './repositories/media-resource.repository';
import { PostRepository } from './repositories/post.repository';
import { MediaResource, MediaResourceSchema } from './schemas/media-resource.schema';
import { Post, PostSchema } from './schemas/post.schema';

const repos: Provider[] = [
  {
    provide: MediaResourceRepository,
    useClass: MongoDBMediaResourceRepository,
  },
  {
    provide: PostRepository,
    useClass: MongoDBPostRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaResource.name, schema: MediaResourceSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  providers: [...repos],
  exports: [...repos],
})
export class DomainModule {}
