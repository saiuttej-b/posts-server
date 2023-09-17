import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { MediaResourcesModule } from 'src/media-resources/media-resources.module';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';

@Module({
  imports: [DomainModule, MediaResourcesModule],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
