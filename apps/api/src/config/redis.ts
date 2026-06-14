import Redis from 'ioredis';
import { config } from './index';

export let redis: Redis;

export async function connectRedis(): Promise<void> {
  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err));

  await new Promise<void>((resolve, reject) => {
    redis.once('ready', resolve);
    redis.once('error', reject);
  });
}

export function getRedis(): Redis {
  if (!redis) throw new Error('Redis not connected');
  return redis;
}
