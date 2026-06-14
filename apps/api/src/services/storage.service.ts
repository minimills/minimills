import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import sharp from 'sharp';
import { minioClient, getPublicUrl } from '../config/storage';
import { config } from '../config';

class StorageService {
  async uploadAvatar(userId: string, buffer: Buffer, mimeType: string): Promise<{ url: string; key: string }> {
    const ext = mimeType.split('/')[1] || 'jpg';
    const key = `public/avatars/${userId}.${ext}`;

    const resized = await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    await minioClient.putObject(config.minio.bucket, key, resized, resized.length, {
      'Content-Type': 'image/jpeg',
    });

    return { url: getPublicUrl(key), key };
  }

  async uploadAttachment(
    cardId: string,
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    size: number
  ): Promise<{ url: string; key: string; name: string }> {
    const ext = path.extname(originalName);
    const key = `attachments/${cardId}/${uuidv4()}${ext}`;

    await minioClient.putObject(config.minio.bucket, key, buffer, size, {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${originalName}"`,
    });

    return { url: getPublicUrl(key), key, name: originalName };
  }

  async uploadCover(
    boardId: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<{ url: string; key: string }> {
    const ext = mimeType.split('/')[1] || 'jpg';
    const key = `public/covers/${boardId}/${uuidv4()}.${ext}`;

    const resized = await sharp(buffer)
      .resize(1200, 400, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();

    await minioClient.putObject(config.minio.bucket, key, resized, resized.length, {
      'Content-Type': 'image/jpeg',
    });

    return { url: getPublicUrl(key), key };
  }

  async deleteFile(key: string): Promise<void> {
    await minioClient.removeObject(config.minio.bucket, key);
  }
}

export const storageService = new StorageService();
