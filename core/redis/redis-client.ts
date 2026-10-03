import Redis from 'ioredis';

/**
 * Production-ready ioredis client wrapper for Empire OS Core.
 * Handles secure connection using process.env.REDIS_URL, retry strategy,
 * graceful shutdown, error logging without exposing secrets, and health checking.
 */

let redisInstance: Redis | null = null;

function getCleanRedisUrl(): string | null {
  const raw = process.env.REDIS_URL;
  if (!raw) return null;
  const cleaned = raw.replace(/^["']|["']$/g, '').trim();
  if (!cleaned || (!cleaned.startsWith('redis://') && !cleaned.startsWith('rediss://'))) {
    return null;
  }
  return cleaned;
}

export function getRedisClient(): Redis {
  if (redisInstance) {
    return redisInstance;
  }

  const redisUrl = getCleanRedisUrl();

  if (redisUrl) {
    try {
      redisInstance = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
        connectTimeout: 3000,
        retryStrategy: (times) => {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts
          }
          return Math.min(times * 300, 1500);
        },
      });

      redisInstance.on('error', (err) => {
        // Log cleanly without crashing process or leaking credentials
        if (err.message.includes('ECONNREFUSED')) {
          // Suppress verbose ECONNREFUSED logs
        } else {
          console.error('[Empire Redis Error]', err.message || 'Connection error');
        }
      });

      redisInstance.on('connect', () => {
        console.log('[Empire Redis] Connected successfully');
      });

      return redisInstance;
    } catch (err: any) {
      console.error('[Empire Redis] Failed to initialize ioredis client');
    }
  }

  // Fallback to local offline client configuration that fails fast without connection spam
  redisInstance = new Redis('redis://127.0.0.1:6379', {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: () => null,
  });

  redisInstance.on('error', () => {
    // Suppress unhandled error events on fallback instance
  });

  return redisInstance;
}

export const redis = getRedisClient();

/**
 * Health check utility for Redis connection
 */
export async function checkRedisHealth(): Promise<'connected' | 'disconnected'> {
  try {
    const client = getRedisClient();
    const response = await client.ping();
    return response === 'PONG' ? 'connected' : 'disconnected';
  } catch {
    return 'disconnected';
  }
}

/**
 * Graceful shutdown for Redis client
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisInstance) {
    try {
      await redisInstance.quit();
    } catch {
      redisInstance.disconnect();
    } finally {
      redisInstance = null;
    }
  }
}
