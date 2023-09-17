import { BadRequestException } from '@nestjs/common';
import { uniq } from 'lodash';
import { MediaResourceRepository } from 'src/domain/repositories/media-resource.repository';
import { MediaResource } from 'src/domain/schemas/media-resource.schema';
import { generateFileName } from 'src/utils/util-functions';
import { MediaResourceManager } from '../managers/media-resource.manager';

const type = 'posts';
const subtypes = {
  coverFiles: 'cover-files',
  resources: 'resources',
};

export class PostResource {
  constructor(
    private readonly manager: MediaResourceManager,
    private readonly mediaRepo: MediaResourceRepository,
  ) {}

  async uploadCoverFile(props: {
    file: Express.Multer.File;
    typeId?: string;
    createdById?: string;
  }) {
    if (!props.file) {
      throw new BadRequestException('File is required');
    }

    const keySuffix = generateFileName(props.file.originalname);

    return this.manager.uploadFile({
      file: props.file,
      type: type,
      subtype: subtypes.coverFiles,
      key: `${type}/${subtypes.coverFiles}/${keySuffix}`,
      typeId: props.typeId,
      createdById: props.createdById,
    });
  }

  async uploadResource(props: {
    file: Express.Multer.File;
    typeId?: string;
    createdById?: string;
  }) {
    if (!props.file) {
      throw new BadRequestException('File is required');
    }

    const keySuffix = generateFileName(props.file.originalname);

    return this.manager.uploadFile({
      file: props.file,
      type: type,
      subtype: subtypes.resources,
      key: `${type}/${subtypes.resources}/${keySuffix}`,
      typeId: props.typeId,
      createdById: props.createdById,
    });
  }

  async delete(typeId: string) {
    const keys = await this.mediaRepo.findToBeDeleted({
      type: type,
      typesIds: [typeId],
    });

    await this.manager.deleteFiles(keys);
  }

  async validateCoverFile(props: { key: string; typeId: string }) {
    if (!props.key) return;

    const media = await this.mediaRepo.findOne({
      type: type,
      subtype: subtypes.coverFiles,
      key: props.key,
    });
    if (!media) {
      throw new BadRequestException('Unable to find cover file');
    }
    if (media.typeId && media.typeId !== props.typeId) {
      throw new BadRequestException('Uploaded cover file is already used');
    }

    return media;
  }

  private async updateCoverFileTypeId(props: { media: MediaResource; typeId: string }) {
    const media = props.media;
    if (media) {
      if (media.typeId === props.typeId) return media;
      media.typeId = props.typeId;

      await this.mediaRepo.updateTypeId([media.key], props.typeId);
    }

    const others = await this.mediaRepo.findByTypeIdAndNotKeys({
      type: type,
      subtype: subtypes.coverFiles,
      typeId: props.typeId,
      keys: media ? [media.key] : [],
    });
    await this.manager.deleteFiles(others.map((x) => x.key));

    return media;
  }

  async updateCoverFile(props: { key: string; typeId: string }) {
    const media = await this.validateCoverFile(props);
    return this.updateCoverFileTypeId({ media, typeId: props.typeId });
  }

  async validateResourceFiles(props: { keys: string[]; typeId: string }) {
    if (!props.keys.length) return [];

    const keys = uniq(props.keys);
    if (props.keys.length !== keys.length) {
      throw new BadRequestException('Duplicate file uploads found');
    }

    const resources = await this.mediaRepo.findByKeys({
      type: type,
      subtype: subtypes.resources,
      keys: props.keys,
    });
    if (resources.length !== props.keys.length) {
      throw new BadRequestException('Unable to find all uploaded files');
    }
    if (resources.some((x) => x.typeId && x.typeId !== props.typeId)) {
      throw new BadRequestException('Some uploaded files are already used');
    }

    return resources;
  }

  private async updateResourceFilesTypeId(props: { resources: MediaResource[]; typeId: string }) {
    const resources = props.resources;

    const keys = resources.filter((r) => r.typeId !== props.typeId).map((r) => r.key);
    await this.mediaRepo.updateTypeId(keys, props.typeId);

    const others = await this.mediaRepo.findByTypeIdAndNotKeys({
      type: type,
      subtype: subtypes.resources,
      typeId: props.typeId,
      keys: resources.map((r) => r.key),
    });
    await this.manager.deleteFiles(others.map((x) => x.key));

    resources.forEach((r) => {
      r.typeId = props.typeId;
    });

    return resources;
  }

  async updateResourceFiles(props: { keys: string[]; typeId: string }) {
    const resources = await this.validateResourceFiles(props);
    return this.updateResourceFilesTypeId({ resources, typeId: props.typeId });
  }

  async updatePostFiles(props: {
    typeId: string;
    coverFileKey?: string;
    resourceFileKeys: string[];
  }) {
    const coverMedia = await this.validateCoverFile({
      key: props.coverFileKey,
      typeId: props.typeId,
    });

    const resourceMedias = await this.validateResourceFiles({
      keys: props.resourceFileKeys,
      typeId: props.typeId,
    });

    const [coverFile, resources] = await Promise.all([
      this.updateCoverFileTypeId({ media: coverMedia, typeId: props.typeId }),
      this.updateResourceFilesTypeId({ resources: resourceMedias, typeId: props.typeId }),
    ]);

    return { coverFile, resources };
  }
}
