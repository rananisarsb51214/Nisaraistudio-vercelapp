import { Queue, QueueEvents } from 'bullmq';

let _libMissionQueue: Queue | null = null;
let _libMissionQueueEvents: QueueEvents | null = null;

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

export function getLibMissionQueue(): Queue {
  if (!_libMissionQueue) {
    _libMissionQueue = new Queue('empire-missions', {
      connection: getRedisConnection(),
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
    _libMissionQueue.on('error', () => {});
  }
  return _libMissionQueue;
}

export function getLibMissionQueueEvents(): QueueEvents {
  if (!_libMissionQueueEvents) {
    _libMissionQueueEvents = new QueueEvents('empire-missions', {
      connection: getRedisConnection(),
    });
    _libMissionQueueEvents.on('error', () => {});
  }
  return _libMissionQueueEvents;
}

export const missionQueue = {
  add: async (...args: Parameters<Queue['add']>) => getLibMissionQueue().add(...args),
  count: async () => {
    try {
      return await getLibMissionQueue().count();
    } catch {
      return 0;
    }
  },
  getJobs: async (...args: Parameters<Queue['getJobs']>) => {
    try {
      return await getLibMissionQueue().getJobs(...args);
    } catch {
      return [];
    }
  },
  on: (event: string, listener: (...args: any[]) => void) => {
    try {
      getLibMissionQueue().on(event as any, listener as any);
    } catch {}
  }
};

export const missionQueueEvents = {
  on: (event: string, listener: (...args: any[]) => void) => {
    try {
      getLibMissionQueueEvents().on(event as any, listener as any);
    } catch {}
  }
};

export async function addMissionJob(
  name: string,
  data: {
    missionId: string;
    stepId?: string;
    agentRole?: string;
    payload?: any;
  },
  opts?: { priority?: number; delay?: number }
) {
  return await getLibMissionQueue().add(name, data, {
    jobId: `job_${data.missionId}_${data.stepId || Date.now()}`,
    priority: opts?.priority,
    delay: opts?.delay,
  });
}
