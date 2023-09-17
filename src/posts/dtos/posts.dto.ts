import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PostContentTypes } from 'src/domain/schemas/post.schema';

export class PostContentDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(PostContentTypes))
  type: string;

  @ValidateIf((o) => o.type === PostContentTypes.TEXT)
  @IsString()
  text?: string;

  @ValidateIf((o) => o.type === PostContentTypes.RESOURCES)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  resourceKeys?: string[];
}

export class PostCreateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  coverFileKey?: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PostContentDto)
  content: PostContentDto[];
}
