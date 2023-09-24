import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetPostsDto, PostCreateDto } from '../dtos/posts.dto';
import { PostsService } from '../services/posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Post('upload/cover-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadCoverFile(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadCoverFile(file);
  }

  @Post('upload/resource')
  @UseInterceptors(FileInterceptor('file'))
  uploadResource(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadResource(file);
  }

  @Post()
  createPost(@Body() reqBody: PostCreateDto) {
    return this.service.createPost(reqBody);
  }

  @Put(':id')
  updatePost(@Body() reqBody: PostCreateDto, @Param('id') id: string) {
    return this.service.updatePost(id, reqBody);
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.service.deletePost(id);
  }

  @Get()
  getPosts(@Query() query: GetPostsDto) {
    return this.service.getPosts(query);
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.service.getPost(id);
  }
}
