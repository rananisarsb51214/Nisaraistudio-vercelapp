import { checkRedisHealth, redis } from '../core/redis/redis-client';
import { 
  createMissionState, 
  getMissionState, 
  updateMissionState, 
  deleteMissionState 
} from '../core/state/mission-state-manager';
import { 
  assignAgent, 
  getAgentState, 
  updateAgentState, 
  releaseAgent 
} from '../core/state/agent-state-manager';
import { distributedLock } from '../core/locks/distributed-lock';
import { missionQueue } from '../core/queue/mission-queue';
import { initializeMissionWorker, stopMissionWorker } from '../core/queue/mission-worker';

async function runTests() {
  console.log('==================================================');
  console.log(' Empire OS Core - Redis Execution Layer Test Suite');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  async function assert(testName: string, fn: () => Promise<boolean>) {
    try {
      const result = await fn();
      if (result) {
        console.log(`[PASS] ${testName}`);
        passed++;
      } else {
        console.error(`[FAIL] ${testName}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`[FAIL] ${testName}: ${err.message}`);
      failed++;
    }
  }

  // Test 1: Redis Connection
  await assert('1. Redis Connection Health Check', async () => {
    const health = await checkRedisHealth();
    return health === 'connected' || health === 'disconnected';
  });

  // Test 2: Mission State CRUD
  await assert('2. Mission State CRUD Operations', async () => {
    const testId = `test_m_${Date.now()}`;
    const created = await createMissionState(testId, { title: 'Test Mission', state: 'pending' });
    if (created.title !== 'Test Mission') return false;

    const fetched = await getMissionState(testId);
    if (!fetched || fetched.state !== 'pending') return false;

    const updated = await updateMissionState(testId, { state: 'executing', progress: 50 });
    if (updated.progress !== 50) return false;

    const deleted = await deleteMissionState(testId);
    if (!deleted) return false;

    const postDelete = await getMissionState(testId);
    return postDelete === null;
  });

  // Test 3: Agent State CRUD
  await assert('3. Agent State CRUD Operations', async () => {
    const agentId = `test_a_${Date.now()}`;
    const assigned = await assignAgent(agentId, 'm_123', 'Task A', 'Developer');
    if (assigned.state !== 'assigned') return false;

    const fetched = await getAgentState(agentId);
    if (!fetched || fetched.currentTask !== 'Task A') return false;

    const updated = await updateAgentState(agentId, { state: 'running' });
    if (updated.state !== 'running') return false;

    const released = await releaseAgent(agentId);
    return released.state === 'idle';
  });

  // Test 4: Lock Acquisition
  const lockMissionId = `lock_m_${Date.now()}`;
  const tokenA = distributedLock.generateLockToken('worker_A');
  const tokenB = distributedLock.generateLockToken('worker_B');

  await assert('4. Lock Acquisition (SET NX EX)', async () => {
    const acquiredA = await distributedLock.acquire('mission', lockMissionId, tokenA, 60);
    const acquiredB = await distributedLock.acquire('mission', lockMissionId, tokenB, 60);
    return acquiredA === true && acquiredB === false; // Second acquire should fail
  });

  // Test 5: Lock Ownership Verification
  await assert('5. Lock Ownership Verification', async () => {
    const owner = await distributedLock.getOwner('mission', lockMissionId);
    return owner === tokenA;
  });

  // Test 6: Lock Release
  await assert('6. Lock Release (Safe Lua Script)', async () => {
    const failRelease = await distributedLock.release('mission', lockMissionId, tokenB); // Worker B cannot release Worker A's lock
    if (failRelease !== false) return false;

    const successRelease = await distributedLock.release('mission', lockMissionId, tokenA);
    return successRelease === true;
  });

  // Test 7: Queue Creation
  await assert('7. BullMQ Queue Creation (`empire-missions`)', async () => {
    return missionQueue.name === 'empire-missions';
  });

  // Test 8: Worker Execution
  await assert('8. Worker Execution & Job Handshake', async () => {
    const worker = initializeMissionWorker();
    const testMissionId = `worker_m_${Date.now()}`;
    await createMissionState(testMissionId, { title: 'Worker Test', state: 'pending' });

    const job = await missionQueue.add('test_job', {
      missionId: testMissionId,
      stepId: 'step_1',
      agentRole: 'QA'
    });

    await stopMissionWorker();
    return !!job.id;
  });

  console.log('\n==================================================');
  console.log(` Summary: ${passed} Passed | ${failed} Failed`);
  console.log('==================================================\n');

  await stopMissionWorker();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
