import { redis } from '../redis/redis-client';
import crypto from 'crypto';

export class DistributedLock {
  private getLockKey(type: 'mission' | 'agent', id: string): string {
    return `empire:lock:${type}:${id}`;
  }

  /**
   * Generates a unique lock token for worker identification
   */
  generateLockToken(workerId?: string): string {
    const randomId = crypto.randomUUID();
    return workerId ? `${workerId}:${randomId}` : randomId;
  }

  /**
   * Acquire a distributed lock using atomic SET key token NX EX ttl
   */
  async acquire(
    type: 'mission' | 'agent',
    id: string,
    lockToken: string,
    ttlSeconds: number = 60
  ): Promise<boolean> {
    try {
      const lockKey = this.getLockKey(type, id);
      const result = await (redis as any).set(lockKey, lockToken, 'NX', 'EX', ttlSeconds);
      return result === 'OK';
    } catch {
      return false;
    }
  }

  /**
   * Safely release a distributed lock using atomic Lua script.
   * Ensures the lock is ONLY deleted if the current token matches the worker's token.
   */
  async release(
    type: 'mission' | 'agent',
    id: string,
    lockToken: string
  ): Promise<boolean> {
    const lockKey = this.getLockKey(type, id);

    // Atomic Lua script preventing deletion of another worker's lock
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      const result = await redis.eval(luaScript, 1, lockKey, lockToken);
      return Number(result) === 1;
    } catch {
      return false;
    }
  }

  /**
   * Check current owner token of a lock
   */
  async getOwner(type: 'mission' | 'agent', id: string): Promise<string | null> {
    try {
      const lockKey = this.getLockKey(type, id);
      return await redis.get(lockKey);
    } catch {
      return null;
    }
  }

  /**
   * Extend lock TTL if caller holds the token
   */
  async extend(
    type: 'mission' | 'agent',
    id: string,
    lockToken: string,
    extraSeconds: number = 60
  ): Promise<boolean> {
    try {
      const lockKey = this.getLockKey(type, id);
      const owner = await redis.get(lockKey);

      if (owner === lockToken) {
        const result = await redis.expire(lockKey, extraSeconds);
        return result === 1;
      }

      return false;
    } catch {
      return false;
    }
  }
}

export const distributedLock = new DistributedLock();
