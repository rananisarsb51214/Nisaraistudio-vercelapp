import { getRedisClient } from '@/core/redis/redis-client';
import { ContentQueueJob, SocialPlatform } from './types';

const redis = getRedisClient();

const PREFIX = 'nisar:vibe';

const inMemoryJobsMap = new Map<string, ContentQueueJob>();
const inMemoryQueueIds: string[] = [];

export class VibeRedisQueue {
  private getKey(key: string) {
    return `${PREFIX}:${key}`;
  }

  /**
   * Acquire a distributed lock for a specific conversation
   */
  async acquireLock(conversationId: string, ttlSeconds: number = 30): Promise<boolean> {
    const lockKey = this.getKey(`lock:${conversationId}`);
    const token = `lock_${Date.now()}_${Math.random()}`;
    try {
      const result = await (redis as any).set(lockKey, token, 'NX', 'EX', ttlSeconds);
      return result === 'OK';
    } catch {
      return true; // Fallback allow
    }
  }

  /**
   * Release a distributed lock
   */
  async releaseLock(conversationId: string): Promise<void> {
    const lockKey = this.getKey(`lock:${conversationId}`);
    try {
      await redis.del(lockKey);
    } catch {
      // Ignore fallback
    }
  }

  /**
   * Rate Limiter for platform accounts (e.g. max 60 replies per hour per account)
   */
  async checkRateLimit(platform: SocialPlatform, accountId: string, limit: number = 60, windowSeconds: number = 3600): Promise<{
    allowed: boolean;
    remaining: number;
  }> {
    const rateKey = this.getKey(`rate:${platform}:${accountId}`);
    try {
      const current = await redis.incr(rateKey);
      if (current === 1) {
        await redis.expire(rateKey, windowSeconds);
      }
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current)
      };
    } catch {
      return { allowed: true, remaining: limit };
    }
  }

  /**
   * Add a job to the Redis queue
   */
  async enqueueJob(job: ContentQueueJob): Promise<ContentQueueJob> {
    inMemoryJobsMap.set(job.id, job);
    inMemoryQueueIds.push(job.id);

    try {
      const jobKey = this.getKey(`job:${job.id}`);
      const queueKey = this.getKey('queue:pending');
      await redis.set(jobKey, JSON.stringify(job));
      await redis.rpush(queueKey, job.id);
    } catch {
      // Fallback in memory
    }

    return job;
  }

  /**
   * Pop next job from Redis queue
   */
  async popNextJob(): Promise<ContentQueueJob | null> {
    try {
      const queueKey = this.getKey('queue:pending');
      const jobId = await redis.lpop(queueKey);
      if (jobId) {
        const jobKey = this.getKey(`job:${jobId}`);
        const dataStr = await redis.get(jobKey);
        if (dataStr) {
          const job: ContentQueueJob = JSON.parse(dataStr);
          job.status = 'PROCESSING';
          await redis.set(jobKey, JSON.stringify(job));
          inMemoryJobsMap.set(job.id, job);
          return job;
        }
      }
    } catch {
      // Memory fallback
    }

    const nextMemoryId = inMemoryQueueIds.shift();
    if (!nextMemoryId) return null;
    const memoryJob = inMemoryJobsMap.get(nextMemoryId);
    if (!memoryJob) return null;
    memoryJob.status = 'PROCESSING';
    return memoryJob;
  }

  /**
   * Update job status
   */
  async updateJob(jobId: string, updates: Partial<ContentQueueJob>): Promise<ContentQueueJob | null> {
    const existing = inMemoryJobsMap.get(jobId);
    if (existing) {
      Object.assign(existing, updates);
    }

    try {
      const jobKey = this.getKey(`job:${jobId}`);
      const dataStr = await redis.get(jobKey);
      if (dataStr) {
        const job: ContentQueueJob = JSON.parse(dataStr);
        Object.assign(job, updates);
        await redis.set(jobKey, JSON.stringify(job));
        inMemoryJobsMap.set(jobId, job);
        return job;
      }
    } catch {
      // Memory fallback
    }

    return existing || null;
  }

  /**
   * List all queued and active jobs
   */
  async listRecentJobs(): Promise<ContentQueueJob[]> {
    const jobsMap = new Map<string, ContentQueueJob>(inMemoryJobsMap);
    try {
      const keys = await redis.keys(`${PREFIX}:job:*`);
      for (const key of keys) {
        const dataStr = await redis.get(key);
        if (dataStr) {
          try {
            const parsed: ContentQueueJob = JSON.parse(dataStr);
            if (parsed?.id) {
              jobsMap.set(parsed.id, parsed);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // Memory fallback
    }

    return Array.from(jobsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const vibeQueue = new VibeRedisQueue();
