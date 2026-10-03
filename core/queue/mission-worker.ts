import { Worker, Job } from 'bullmq';
import { queueConnection } from './mission-queue';
import { getMissionState, updateMissionState } from '../state/mission-state-manager';
import { assignAgent, releaseAgent, updateAgentState } from '../state/agent-state-manager';
import { distributedLock } from '../locks/distributed-lock';

export interface MissionJobPayload {
  missionId: string;
  stepId?: string;
  agentRole?: 'Developer' | 'QA' | 'Security' | 'DevOps';
  workerId?: string;
  payload?: any;
}

let missionWorkerInstance: Worker | null = null;

export function initializeMissionWorker(): Worker {
  if (missionWorkerInstance) return missionWorkerInstance;

  missionWorkerInstance = new Worker<MissionJobPayload>(
    'empire-missions',
    async (job: Job<MissionJobPayload>) => {
      const { missionId, stepId, agentRole, workerId = `worker_${Date.now()}` } = job.data;
      const lockToken = distributedLock.generateLockToken(workerId);

      // 1. Acquire Distributed Lock
      const acquired = await distributedLock.acquire('mission', missionId, lockToken, 120);
      if (!acquired) {
        throw new Error(`Failed to acquire lock for mission ${missionId}`);
      }

      try {
        // 2. Load Mission State
        const mission = await getMissionState(missionId);
        if (!mission) {
          throw new Error(`Mission ${missionId} state not found`);
        }

        // 3. Update Mission & Agent State to executing
        await updateMissionState(missionId, {
          state: 'executing',
          currentStep: stepId || 'Processing Queue Job',
          currentAgent: agentRole || 'Developer',
        });

        const agentId = `agent_${(agentRole || 'developer').toLowerCase()}_${missionId}`;
        await assignAgent(agentId, missionId, stepId || 'Queue Execution', agentRole);
        await updateAgentState(agentId, { state: 'running' });

        // 4. Execute Simulated Work/Task
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 5. Update Agent & Mission Progress
        await updateAgentState(agentId, { state: 'completed' });
        await releaseAgent(agentId);

        await updateMissionState(missionId, {
          progress: Math.min(100, (mission.progress || 0) + 25),
        });

        return {
          status: 'success',
          missionId,
          stepId,
          executedBy: agentRole,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Record Error in Mission State
        await updateMissionState(missionId, {
          state: 'failed',
          error: error.message || 'Worker job execution failed',
        });
        throw error;
      } finally {
        // 6. Safely Release Distributed Lock
        await distributedLock.release('mission', missionId, lockToken);
      }
    },
    {
      connection: queueConnection,
      concurrency: 5,
    }
  );

  missionWorkerInstance.on('completed', (job) => {
    console.log(`[Empire Worker] Job ${job.id} completed for mission ${job.data.missionId}`);
  });

  missionWorkerInstance.on('failed', (job, err) => {
    console.error(`[Empire Worker] Job ${job?.id} failed:`, err.message);
  });

  missionWorkerInstance.on('error', () => {
    // Suppress unhandled EventEmitter errors when Redis is disconnected
  });

  return missionWorkerInstance;
}

export async function stopMissionWorker(): Promise<void> {
  if (missionWorkerInstance) {
    await missionWorkerInstance.close();
    missionWorkerInstance = null;
  }
}
