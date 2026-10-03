import { redis } from '../redis/redis-client';

export type AgentState =
  | "idle"
  | "assigned"
  | "running"
  | "waiting"
  | "completed"
  | "failed";

export interface AgentRuntimeState {
  agentId: string;
  agentRole?: 'Developer' | 'QA' | 'Security' | 'DevOps' | 'Planner' | 'Validator';
  missionId?: string;
  state: AgentState;
  currentTask?: string;
  startedAt?: string;
  updatedAt: string;
  error?: string;
}

function getAgentKey(agentId: string): string {
  return `empire:agent:${agentId}`;
}

const inMemoryAgents = new Map<string, AgentRuntimeState>();

/**
 * Assigns an agent to a task/mission
 */
export async function assignAgent(
  agentId: string,
  missionId: string,
  currentTask: string,
  agentRole?: AgentRuntimeState['agentRole']
): Promise<AgentRuntimeState> {
  const key = getAgentKey(agentId);
  const now = new Date().toISOString();

  const state: AgentRuntimeState = {
    agentId,
    agentRole: agentRole || 'Developer',
    missionId,
    state: "assigned",
    currentTask,
    startedAt: now,
    updatedAt: now,
  };

  inMemoryAgents.set(agentId, state);

  try {
    await redis.set(key, JSON.stringify(state));
  } catch {
    // Graceful fallback
  }

  return state;
}

/**
 * Gets agent runtime state from Redis
 */
export async function getAgentState(agentId: string): Promise<AgentRuntimeState | null> {
  const key = getAgentKey(agentId);
  try {
    const data = await redis.get(key);
    if (data) {
      const parsed = JSON.parse(data) as AgentRuntimeState;
      inMemoryAgents.set(agentId, parsed);
      return parsed;
    }
  } catch {
    // Graceful fallback
  }
  return inMemoryAgents.get(agentId) || null;
}

/**
 * Updates agent state in Redis
 */
export async function updateAgentState(
  agentId: string,
  updates: Partial<AgentRuntimeState>
): Promise<AgentRuntimeState> {
  const existing = await getAgentState(agentId);
  const now = new Date().toISOString();

  const updated: AgentRuntimeState = {
    agentId,
    agentRole: updates.agentRole || existing?.agentRole || 'Developer',
    missionId: updates.missionId ?? existing?.missionId,
    state: updates.state || existing?.state || 'idle',
    currentTask: updates.currentTask ?? existing?.currentTask,
    startedAt: existing?.startedAt || now,
    updatedAt: now,
    error: updates.error ?? existing?.error,
  };

  inMemoryAgents.set(agentId, updated);

  try {
    const key = getAgentKey(agentId);
    await redis.set(key, JSON.stringify(updated));
  } catch {
    // Graceful fallback
  }

  return updated;
}

/**
 * Releases an agent back to idle state
 */
export async function releaseAgent(agentId: string): Promise<AgentRuntimeState> {
  return updateAgentState(agentId, {
    state: 'idle',
    currentTask: undefined,
    missionId: undefined,
    error: undefined,
  });
}

/**
 * Agent State Manager class wrapper
 */
export class AgentStateManager {
  async assign(agentId: string, missionId: string, task: string, role?: AgentRuntimeState['agentRole']): Promise<AgentRuntimeState> {
    return assignAgent(agentId, missionId, task, role);
  }

  async get(agentId: string): Promise<AgentRuntimeState | null> {
    return getAgentState(agentId);
  }

  async update(agentId: string, partialState: Partial<AgentRuntimeState>): Promise<AgentRuntimeState> {
    return updateAgentState(agentId, partialState);
  }

  async release(agentId: string): Promise<AgentRuntimeState> {
    return releaseAgent(agentId);
  }

  async listAllAgents(): Promise<AgentRuntimeState[]> {
    const agentsMap = new Map<string, AgentRuntimeState>(inMemoryAgents);

    try {
      const keys = await redis.keys('empire:agent:*');
      for (const key of keys) {
        const dataStr = await redis.get(key);
        if (dataStr) {
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed?.agentId) {
              agentsMap.set(parsed.agentId, parsed);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // Fallback to in-memory
    }

    return Array.from(agentsMap.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}

export const agentState = new AgentStateManager();
