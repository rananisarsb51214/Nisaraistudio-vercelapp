import { Queue, QueueEvents } from 'bullmq';

let _missionQueue: Queue | null = null;
let _missionQueueEvents: QueueEvents | null = null;

function getRedisConnection() {
  const redisUrl = (process.env.REDIS_URL || '').replace(/^["']|["']$/g, '').trim() || 'redis://127.0.0.1:6379';
  try {
    const parsed = new URL(redisUrl);
    return {
      host: parsed.hostname || '127.0.0.1',
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      tls: parsed.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    };
  } catch {
    return {
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null,
    };
  }
}

export const queueConnection = getRedisConnection();

export function getMissionQueue(): Queue {
  if (!_missionQueue) {
    _missionQueue = new Queue('empire-missions', {
      connection: queueConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
    _missionQueue.on('error', () => {});
  }
  return _missionQueue;
}

export function getMissionQueueEvents(): QueueEvents {
  if (!_missionQueueEvents) {
    _missionQueueEvents = new QueueEvents('empire-missions', {
      connection: queueConnection,
    });
    _missionQueueEvents.on('error', () => {});
  }
  return _missionQueueEvents;
}

export const missionQueue = {
  name: 'empire-missions',
  add: async (...args: Parameters<Queue['add']>) => getMissionQueue().add(...args),
  count: async () => {
    try {
      return await getMissionQueue().count();
    } catch {
      return 0;
    }
  },
  getJobs: async (...args: Parameters<Queue['getJobs']>) => {
    try {
      return await getMissionQueue().getJobs(...args);
    } catch {
      return [];
    }
  },
  on: (event: string, listener: (...args: any[]) => void) => {
    try {
      getMissionQueue().on(event as any, listener as any);
    } catch {}
  }
};

export const missionQueueEvents = {
  on: (event: string, listener: (...args: any[]) => void) => {
    try {
      getMissionQueueEvents().on(event as any, listener as any);
    } catch {}
  }
};

export async function enqueueMissionJob(
  jobName: string,
  payload: { missionId: string; stepId?: string; agentRole?: string; [key: string]: any },
  options?: { priority?: number; delay?: number }
) {
  return await getMissionQueue().add(jobName, payload, {
    jobId: `job_${payload.missionId}_${payload.stepId || Date.now()}`,
    priority: options?.priority,
    delay: options?.delay,
  });
}
