import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MediaResource, MediaResourceSubSchema } from './media-resource.schema';

export const PostCName = 'posts';
export type PostDocument = HydratedDocument<Post>;

export const PostContentTypes = {
  TEXT: 'text',
  RESOURCES: 'resources',
};

@Schema({ _id: false })
export class PostContent {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: Object.values(PostContentTypes) })
  type: string;

  @Prop({ trim: true })
  text: string;

  @Prop({ type: [MediaResourceSubSchema] })
  resources: MediaResource[];
}
const PostContentSchema = SchemaFactory.createForClass(PostContent);

@Schema({ collection: PostCName, timestamps: true })
export class Post {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  shortDescription: string;

  @Prop({ type: MediaResourceSubSchema })
  resource: MediaResource;

  @Prop({ required: true, type: [PostContentSchema] })
  content: PostContent[];

  @Prop()
  createdById: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ id: -1 }, { unique: true });
