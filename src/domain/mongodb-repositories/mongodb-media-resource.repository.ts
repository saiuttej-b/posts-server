import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaResource, MediaResourceDocument } from 'src/domain/schemas/media-resource.schema';
import { generateTimestampId } from 'src/utils/util-functions';
import { MediaResourceRepository } from '../repositories/media-resource.repository';

@Injectable()
export class MongoDBMediaResourceRepository implements MediaResourceRepository {
  constructor(@InjectModel(MediaResource.name) private readonly mediaModel: Model<MediaResource>) {}

  instance(data?: Partial<MediaResource>): MediaResource {
    const media = new MediaResource();
    if (data) Object.assign(media, data);
    if (!media.id) media.id = generateTimestampId();

    return media;
  }

  async insertAndGet(media: MediaResource): Promise<MediaResource> {
    if (!media.id) media.id = generateTimestampId();

    const mediaDoc = new this.mediaModel(media);
    const record = await mediaDoc.save();
    return this.convert(record);
  }

  async save(media: MediaResource): Promise<MediaResource> {
    if (!media.id) return this.insertAndGet(media);

    const previous = await this.mediaModel.findOne({ id: media.id }).exec();
    if (!previous) return this.insertAndGet(media);

    Object.assign(previous, media);
    if (!previous.isNew && !previous.isModified()) return this.convert(previous);

    const record = await previous.save();
    return this.convert(record);
  }

  async updateTypeId(keys: string[], typeId: string): Promise<void> {
    if (!keys.length) return;

    await this.mediaModel.updateOne({ key: { $in: keys } }, { typeId }).exec();
  }

  async deleteByKeys(keys: string[]): Promise<void> {
    if (!keys.length) return;

    await this.mediaModel.deleteMany({ key: { $in: keys } }).exec();
  }

  async findById(id: string): Promise<MediaResource> {
    const media = await this.mediaModel.findOne({ id }).exec();
    return this.convert(media);
  }

  async findOne(props: { type: string; subtype: string; key: string }): Promise<MediaResource> {
    const media = await this.mediaModel
      .findOne({
        type: props.type,
        subtype: props.subtype,
        key: props.key,
      })
      .exec();
    return this.convert(media);
  }

  async findByTypeIdAndNotKeys(props: {
    type: string;
    subtype: string;
    typeId: string;
    keys: string[];
  }): Promise<MediaResource[]> {
    const media = await this.mediaModel
      .find({
        type: props.type,
        subtype: props.subtype,
        typeId: props.typeId,
        ...(props.keys.length && { key: { $nin: props.keys } }),
      })
      .exec();
    return this.convert(media);
  }

  async findByKeys(props: {
    type: string;
    subtype: string;
    keys: string[];
  }): Promise<MediaResource[]> {
    if (!props.keys.length) return [];

    const media = await this.mediaModel
      .find({ type: props.type, subtype: props.subtype, key: { $in: props.keys } })
      .exec();
    return this.convert(media);
  }

  private convert(data: MediaResourceDocument): MediaResource;
  private convert(data: MediaResourceDocument[]): MediaResource[];
  private convert(data: MediaResourceDocument | MediaResourceDocument[]) {
    if (!data) return;
    if (Array.isArray(data)) return data.map((item) => this.convert(item));

    const resource = new MediaResource();
    Object.assign(resource, data.toJSON());

    delete resource['_id'];
    delete resource['__v'];
    return resource;
  }
}
