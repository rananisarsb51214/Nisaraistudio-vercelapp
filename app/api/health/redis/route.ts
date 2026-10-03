import { NextResponse } from 'next/server';
import { checkRedisHealth } from '@/core/redis/redis-client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const status = await checkRedisHealth();
    return NextResponse.json({ redis: status });
  } catch {
    return NextResponse.json({ redis: 'disconnected' }, { status: 500 });
  }
}
