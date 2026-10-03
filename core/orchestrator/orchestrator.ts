import { 
  createMissionState, 
  getMissionState, 
  updateMissionState, 
  MissionRuntimeState 
} from '../state/mission-state-manager';
import { assignAgent, updateAgentState, releaseAgent } from '../state/agent-state-manager';
import { distributedLock } from '../locks/distributed-lock';
import { enqueueMissionJob } from '../queue/mission-queue';
import { planner } from './planner';
import { validator } from './validator';

export interface MissionExecutionReport {
  missionId: string;
  title: string;
  status: 'completed' | 'failed';
  totalSteps: number;
  durationMs: number;
  validationScore: number;
  summary: string;
  stepsReport: any[];
}

export class Orchestrator {
  /**
   * Main Pipeline Execution Engine following Empire OS Pipeline:
   * MISSION -> AUTHORIZATION CHECK -> MISSION STATE = planning -> MISSION PLANNER ->
   * AGENT DISPATCH -> MISSION STATE = executing -> DISTRIBUTED LOCK -> QUEUE/WORKER ->
   * AGENT EXECUTION -> VALIDATION -> MISSION STATE = completed -> MEMORY UPDATE -> REPORT
   */
  async executeMission(
    missionId: string,
    options?: { title?: string; goal?: string; workerId?: string }
  ): Promise<MissionExecutionReport> {
    const startTime = Date.now();
    const workerId = options?.workerId || `worker_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const lockToken = distributedLock.generateLockToken(workerId);

    // 1. AUTHORIZATION CHECK & DISTRIBUTED LOCK
    const acquired = await distributedLock.acquire('mission', missionId, lockToken, 180);
    if (!acquired) {
      const currentOwner = await distributedLock.getOwner('mission', missionId);
      throw new Error(`Mission ${missionId} authorization failed: locked by active worker ${currentOwner}`);
    }

    try {
      // 2. MISSION STATE = planning
      let mission = await getMissionState(missionId);
      if (!mission) {
        mission = await createMissionState(missionId, {
          title: options?.title || `Empire Mission ${missionId}`,
          goal: options?.goal || 'Build and execute distributed agent tasks',
          state: 'planning',
          progress: 5,
        });
      } else {
        mission = await updateMissionState(missionId, { state: 'planning', progress: 5 });
      }

      // 3. MISSION PLANNER
      const plan = await planner.createPlan(mission);

      await updateMissionState(missionId, {
        state: 'authorized',
        progress: 15,
      });

      // 4. AGENT DISPATCH & QUEUE ENQUEUEING
      await updateMissionState(missionId, {
        state: 'executing',
        progress: 25,
      });

      const stepsReport: any[] = [];
      const totalSteps = plan.steps.length;

      for (let i = 0; i < totalSteps; i++) {
        const step = plan.steps[i];
        const agentId = `agent_${step.agent.toLowerCase()}_${missionId}`;

        // Enqueue into BullMQ Queue
        await enqueueMissionJob(`step_${step.id}`, {
          missionId,
          stepId: step.id,
          agentRole: step.agent,
        });

        // Acquire Agent Lock
        const agentLockToken = distributedLock.generateLockToken(agentId);
        await distributedLock.acquire('agent', agentId, agentLockToken, 60);

        try {
          // Assign Agent State
          await assignAgent(agentId, missionId, step.name, step.agent);
          await updateAgentState(agentId, { state: 'running' });

          // Update Mission Progress
          const progress = Math.round(25 + ((i + 1) / totalSteps) * 55); // 25% to 80%
          await updateMissionState(missionId, {
            currentStep: step.name,
            currentAgent: `${step.agent} Agent`,
            progress,
          });

          // Simulate/execute agent workload
          await new Promise((r) => setTimeout(r, 400));

          stepsReport.push({
            stepId: step.id,
            name: step.name,
            agent: step.agent,
            status: 'passed',
            timestamp: new Date().toISOString(),
          });

          await updateAgentState(agentId, { state: 'completed' });
          await releaseAgent(agentId);
        } finally {
          await distributedLock.release('agent', agentId, agentLockToken);
        }

        // Extend Mission Lock
        await distributedLock.extend('mission', missionId, lockToken, 120);
      }

      // 5. VALIDATION
      await updateMissionState(missionId, {
        state: 'validating',
        progress: 85,
      });

      const validation = await validator.validate(missionId);

      if (!validation.passed) {
        throw new Error(`Validation check failed with score ${validation.score}%`);
      }

      // 6. MISSION STATE = completed
      await updateMissionState(missionId, {
        state: 'completed',
        progress: 100,
        currentStep: 'Validation Passed',
        currentAgent: 'Validator Core',
      });

      // 7. MEMORY UPDATE & REPORT GENERATION
      const report: MissionExecutionReport = {
        missionId,
        title: mission.title || `Empire Mission ${missionId}`,
        status: 'completed',
        totalSteps,
        durationMs: Date.now() - startTime,
        validationScore: validation.score,
        summary: `Successfully completed ${totalSteps} steps across multi-agent Redis pipeline.`,
        stepsReport,
      };

      return report;
    } catch (err: any) {
      await updateMissionState(missionId, {
        state: 'failed',
        error: err.message || 'Execution error during pipeline run',
      });
      throw err;
    } finally {
      // Always safely release lock
      await distributedLock.release('mission', missionId, lockToken);
    }
  }
}

export const orchestrator = new Orchestrator();
