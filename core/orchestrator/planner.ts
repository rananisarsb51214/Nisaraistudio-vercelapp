import { MissionRuntimeState } from '../state/mission-state-manager';

export interface PlanStep {
  id: string;
  name: string;
  agent: 'Developer' | 'QA' | 'Security' | 'DevOps';
  description: string;
}

export interface ExecutionPlan {
  missionId: string;
  steps: PlanStep[];
}

export class Planner {
  /**
   * Deconstructs mission goals into structured agent execution steps
   */
  async createPlan(mission: MissionRuntimeState): Promise<ExecutionPlan> {
    const goalLower = (mission.goal || '').toLowerCase();

    // Default step pipeline covering Developer -> Security -> QA -> DevOps
    const steps: PlanStep[] = [
      {
        id: `step_1_dev`,
        name: 'Architecture & Code Implementation',
        agent: 'Developer',
        description: `Implement core logic and modules for: ${mission.title || mission.goal}`
      },
      {
        id: `step_2_sec`,
        name: 'Security Vulnerability Audit',
        agent: 'Security',
        description: `Scan code for SQL injection, XSS, token leaks, and permission bypasses.`
      },
      {
        id: `step_3_qa`,
        name: 'Quality Assurance & Automated Testing',
        agent: 'QA',
        description: `Verify end-to-end functionality, edge cases, and unit tests.`
      },
      {
        id: `step_4_devops`,
        name: 'Deployment & Redis Cluster Orchestration',
        agent: 'DevOps',
        description: `Configure Cloud Run container builds, environment secrets, and Redis execution routing.`
      }
    ];

    if (goalLower.includes('security') || goalLower.includes('auth')) {
      steps.unshift({
        id: 'step_0_sec_prep',
        name: 'Security Policy Formulation',
        agent: 'Security',
        description: 'Establish Firestore RBAC rules and token verification protocols.'
      });
    }

    return {
      missionId: mission.missionId,
      steps
    };
  }
}

export const planner = new Planner();
