import * as Minio from 'minio';
import { config } from './index';

export const minioClient = new Minio.Client({
  endPoint: config.minio.endpoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
});

export async function ensureMinIOBucket(): Promise<void> {
  const bucket = config.minio.bucket;
  try {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket, 'us-east-1');
      // Set public read policy for avatars/covers
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/public/*`],
          },
        ],
      });
      await minioClient.setBucketPolicy(bucket, policy);
      console.log(`MinIO bucket '${bucket}' created`);
    } else {
      console.log(`MinIO bucket '${bucket}' ready`);
    }
  } catch (err) {
    console.error('MinIO setup error:', err);
  }
}

export function getPublicUrl(key: string): string {
  const protocol = config.minio.useSSL ? 'https' : 'http';
  const portStr = config.minio.port !== 80 && config.minio.port !== 443 ? `:${config.minio.port}` : '';
  return `${protocol}://${config.minio.endpoint}${portStr}/${config.minio.bucket}/${key}`;
}

export async function getPresignedUrl(key: string, expiry = 3600): Promise<string> {
  return minioClient.presignedGetObject(config.minio.bucket, key, expiry);
}

export async function deleteObject(key: string): Promise<void> {
  await minioClient.removeObject(config.minio.bucket, key);
}
