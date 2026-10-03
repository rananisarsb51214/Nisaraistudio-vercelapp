import { redis } from '../redis/redis-client';

export type JobStatus = 'queued' | 'active' | 'completed' | 'failed';

export interface EmpireJob<T = any> {
  id: string;
  name: string;
  missionId: string;
  stepId?: string;
  agentRole?: string;
  data: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const inMemoryJobs = new Map<string, EmpireJob>();
const inMemoryQueueIds: string[] = [];
const inMemoryActiveIds: string[] = [];

export class JobQueue {
  private queueKey = 'empire:queue:jobs';
  private activeKey = 'empire:queue:active';

  private getJobKey(jobId: string): string {
    return `empire:job:${jobId}`;
  }

  /**
   * Enqueue a new mission or step execution job into Redis
   */
  async add<T>(name: string, data: T & { missionId: string; stepId?: string; agentRole?: string }, options?: { maxAttempts?: number }): Promise<EmpireJob<T>> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const job: EmpireJob<T> = {
      id: jobId,
      name,
      missionId: data.missionId,
      stepId: data.stepId,
      agentRole: data.agentRole,
      data,
      status: 'queued',
      attempts: 0,
      maxAttempts: options?.maxAttempts || 3,
      createdAt: now,
      updatedAt: now
    };

    inMemoryJobs.set(jobId, job);
    inMemoryQueueIds.push(jobId);

    try {
      await redis.set(this.getJobKey(jobId), JSON.stringify(job));
      await redis.rpush(this.queueKey, jobId);
    } catch {
      // Fallback to memory queue
    }

    return job;
  }

  /**
   * Dequeue the next available job from Redis queue
   */
  async getNextJob(): Promise<EmpireJob | null> {
    try {
      const jobId = await redis.lpop(this.queueKey);
      if (jobId) {
        const jobKey = this.getJobKey(jobId);
        const jobDataStr = await redis.get(jobKey);
        if (jobDataStr) {
          const job: EmpireJob = JSON.parse(jobDataStr);
          job.status = 'active';
          job.attempts += 1;
          job.updatedAt = new Date().toISOString();

          await redis.set(jobKey, JSON.stringify(job));
          await redis.rpush(this.activeKey, jobId);
          inMemoryJobs.set(jobId, job);
          return job;
        }
      }
    } catch {
      // Memory fallback
    }

    const memoryJobId = inMemoryQueueIds.shift();
    if (!memoryJobId) return null;
    const memoryJob = inMemoryJobs.get(memoryJobId);
    if (!memoryJob) return null;

    memoryJob.status = 'active';
    memoryJob.attempts += 1;
    memoryJob.updatedAt = new Date().toISOString();
    inMemoryActiveIds.push(memoryJobId);
    return memoryJob;
  }

  /**
   * Mark job completed with result
   */
  async markCompleted(jobId: string, result: any): Promise<EmpireJob | null> {
    const memoryJob = inMemoryJobs.get(jobId);
    if (memoryJob) {
      memoryJob.status = 'completed';
      memoryJob.result = result;
      memoryJob.updatedAt = new Date().toISOString();
    }

    try {
      const jobKey = this.getJobKey(jobId);
      const jobDataStr = await redis.get(jobKey);
      if (jobDataStr) {
        const job: EmpireJob = JSON.parse(jobDataStr);
        job.status = 'completed';
        job.result = result;
        job.updatedAt = new Date().toISOString();

        await redis.set(jobKey, JSON.stringify(job));
        return job;
      }
    } catch {
      // Fallback to memory
    }

    return memoryJob || null;
  }

  /**
   * Mark job failed with error
   */
  async markFailed(jobId: string, error: string): Promise<EmpireJob | null> {
    const memoryJob = inMemoryJobs.get(jobId);
    if (memoryJob) {
      memoryJob.status = 'failed';
      memoryJob.error = error;
      memoryJob.updatedAt = new Date().toISOString();
    }

    try {
      const jobKey = this.getJobKey(jobId);
      const jobDataStr = await redis.get(jobKey);
      if (jobDataStr) {
        const job: EmpireJob = JSON.parse(jobDataStr);
        job.status = 'failed';
        job.error = error;
        job.updatedAt = new Date().toISOString();

        await redis.set(jobKey, JSON.stringify(job));
        return job;
      }
    } catch {
      // Fallback
    }

    return memoryJob || null;
  }

  /**
   * Get queue length
   */
  async getQueueLength(): Promise<{ queued: number; active: number }> {
    try {
      const queued = await redis.llen(this.queueKey);
      const active = await redis.llen(this.activeKey);
      return { queued, active };
    } catch {
      return { queued: inMemoryQueueIds.length, active: inMemoryActiveIds.length };
    }
  }

  /**
   * List recent jobs from Redis
   */
  async listRecentJobs(): Promise<EmpireJob[]> {
    const jobsMap = new Map<string, EmpireJob>(inMemoryJobs);

    try {
      const keys = await redis.keys('empire:job:*');
      for (const key of keys) {
        const jobStr = await redis.get(key);
        if (jobStr) {
          try {
            const parsed = JSON.parse(jobStr);
            if (parsed?.id) {
              jobsMap.set(parsed.id, parsed);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // Fallback
    }

    return Array.from(jobsMap.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}

export const missionQueue = new JobQueue();
