import { NextRequest, NextResponse } from 'next/server';
import { missionState } from '@/core/state/mission-state-manager';
import { agentState } from '@/core/state/agent-state-manager';
import { distributedLock } from '@/core/locks/distributed-lock';
import { missionQueue } from '@/core/queue/job-queue';
import { orchestrator } from '@/core/orchestrator/orchestrator';
import { checkRedisHealth } from '@/core/redis/redis-client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const health = await checkRedisHealth();
    const missions = await missionState.listAllMissions();
    const agents = await agentState.listAllAgents();
    const queueStats = await missionQueue.getQueueLength();
    const recentJobs = await missionQueue.listRecentJobs();

    // Fetch locks for all missions
    const locks: Record<string, string | null> = {};
    for (const m of missions) {
      locks[m.missionId] = await distributedLock.getOwner('mission', m.missionId);
    }

    return NextResponse.json({
      redisActive: health === 'connected',
      redisStatus: health,
      redisMode: health === 'connected' ? 'External Redis Instance Connected' : 'In-Memory State Store (Fallback)',
      missions,
      agents,
      queueStats,
      recentJobs,
      locks
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to query Redis layer' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, missionId, title, goal, workerId } = body;

    if (action === 'create_and_execute' || action === 'execute_mission') {
      const targetMissionId = missionId || `m_${Date.now()}`;
      
      // Trigger mission execution asynchronously via orchestrator
      orchestrator.executeMission(targetMissionId, {
        title: title || `Empire Mission ${targetMissionId}`,
        goal: goal || 'Automated multi-agent execution pipeline',
        workerId: workerId || `worker_${Date.now()}`
      }).catch(err => {
        console.error("Orchestrator execution error:", err);
      });

      return NextResponse.json({
        success: true,
        message: `Mission ${targetMissionId} queued and orchestrator triggered via Redis execution layer.`,
        missionId: targetMissionId
      });
    }

    if (action === 'release_lock') {
      if (!missionId) {
        return NextResponse.json({ error: 'missionId is required' }, { status: 400 });
      }
      const owner = await distributedLock.getOwner('mission', missionId);
      if (owner) {
        await distributedLock.release('mission', missionId, owner);
      }
      return NextResponse.json({ success: true, message: `Lock released for mission ${missionId}` });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Redis execution request failed' }, { status: 500 });
  }
}
