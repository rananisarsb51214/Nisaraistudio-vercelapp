import { redis } from '../redis/redis-client';

export type MissionState =
  | "pending"
  | "planning"
  | "authorized"
  | "executing"
  | "validating"
  | "completed"
  | "failed"
  | "rolled_back"
  | "cancelled";

export interface MissionRuntimeState {
  missionId: string;
  state: MissionState;
  title?: string;
  goal?: string;
  currentStep?: string;
  currentAgent?: string;
  progress: number;
  startedAt?: string;
  updatedAt: string;
  error?: string;
}

export interface StepCheckpoint {
  stepId: string;
  agentId: string;
  status: 'passed' | 'failed' | 'skipped';
  output: any;
  timestamp: string;
}

function getMissionKey(missionId: string): string {
  return `empire:mission:${missionId}`;
}

// In-memory fallback map when Redis is offline/unreachable
const inMemoryMissions = new Map<string, MissionRuntimeState>();

/**
 * Creates a new mission state entry in Redis with in-memory fallback
 */
export async function createMissionState(
  missionId: string,
  initialData: Partial<MissionRuntimeState>
): Promise<MissionRuntimeState> {
  const key = getMissionKey(missionId);
  const now = new Date().toISOString();

  const state: MissionRuntimeState = {
    missionId,
    state: initialData.state || "pending",
    title: initialData.title || `Mission ${missionId}`,
    goal: initialData.goal || '',
    currentStep: initialData.currentStep,
    currentAgent: initialData.currentAgent,
    progress: initialData.progress || 0,
    startedAt: initialData.startedAt || now,
    updatedAt: now,
    error: initialData.error,
  };

  inMemoryMissions.set(missionId, state);

  try {
    await redis.set(key, JSON.stringify(state));
  } catch {
    // Graceful fallback to memory
  }

  return state;
}

/**
 * Fetches a mission state entry from Redis with in-memory fallback
 */
export async function getMissionState(missionId: string): Promise<MissionRuntimeState | null> {
  const key = getMissionKey(missionId);
  try {
    const data = await redis.get(key);
    if (data) {
      const parsed = JSON.parse(data) as MissionRuntimeState;
      inMemoryMissions.set(missionId, parsed);
      return parsed;
    }
  } catch {
    // Fallback to memory
  }
  return inMemoryMissions.get(missionId) || null;
}

/**
 * Updates an existing mission state in Redis
 */
export async function updateMissionState(
  missionId: string,
  updates: Partial<MissionRuntimeState>
): Promise<MissionRuntimeState> {
  const existing = await getMissionState(missionId);
  const now = new Date().toISOString();

  if (!existing) {
    return createMissionState(missionId, updates);
  }

  const updated: MissionRuntimeState = {
    ...existing,
    ...updates,
    updatedAt: now,
  };

  inMemoryMissions.set(missionId, updated);

  try {
    const key = getMissionKey(missionId);
    await redis.set(key, JSON.stringify(updated));
  } catch {
    // Graceful fallback
  }

  return updated;
}

/**
 * Deletes a mission state entry from Redis
 */
export async function deleteMissionState(missionId: string): Promise<boolean> {
  inMemoryMissions.delete(missionId);
  try {
    const key = getMissionKey(missionId);
    const checkpointKey = `empire:mission:${missionId}:checkpoints`;
    const count = await redis.del(key, checkpointKey);
    return count > 0;
  } catch {
    return true;
  }
}

/**
 * Class wrapper maintaining backward compatibility
 */
export class MissionStateManager {
  async set(missionId: string, runtimeState: Partial<MissionRuntimeState> & { state: MissionState }): Promise<MissionRuntimeState> {
    return createMissionState(missionId, runtimeState);
  }

  async get(missionId: string): Promise<MissionRuntimeState | null> {
    return getMissionState(missionId);
  }

  async update(missionId: string, partialState: Partial<MissionRuntimeState>): Promise<MissionRuntimeState> {
    return updateMissionState(missionId, partialState);
  }

  async delete(missionId: string): Promise<boolean> {
    return deleteMissionState(missionId);
  }

  async setCheckpoint(missionId: string, stepId: string, checkpoint: Omit<StepCheckpoint, 'stepId' | 'timestamp'>): Promise<StepCheckpoint> {
    const fullCheckpoint: StepCheckpoint = {
      stepId,
      agentId: checkpoint.agentId,
      status: checkpoint.status,
      output: checkpoint.output,
      timestamp: new Date().toISOString(),
    };
    const key = `empire:mission:${missionId}:checkpoints`;
    await redis.hset(key, stepId, JSON.stringify(fullCheckpoint));
    return fullCheckpoint;
  }

  async getCheckpoints(missionId: string): Promise<Record<string, StepCheckpoint>> {
    const key = `empire:mission:${missionId}:checkpoints`;
    const hashData = await redis.hgetall(key);
    const result: Record<string, StepCheckpoint> = {};
    for (const [stepId, valStr] of Object.entries(hashData)) {
      try {
        result[stepId] = JSON.parse(valStr);
      } catch {
        // ignore invalid json
      }
    }
    return result;
  }

  async listAllMissions(): Promise<MissionRuntimeState[]> {
    const missionsMap = new Map<string, MissionRuntimeState>(inMemoryMissions);

    try {
      const keys = await redis.keys('empire:mission:*');
      const primaryKeys = keys.filter((k) => !k.includes(':checkpoints'));

      for (const key of primaryKeys) {
        const dataStr = await redis.get(key);
        if (dataStr) {
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed?.missionId) {
              missionsMap.set(parsed.missionId, parsed);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // Return in-memory missions on error
    }

    return Array.from(missionsMap.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}

export const missionState = new MissionStateManager();
