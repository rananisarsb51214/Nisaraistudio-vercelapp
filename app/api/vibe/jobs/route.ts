export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { vibeQueue } from '@/lib/vibe/redisQueue';

export async function GET() {
  try {
    const jobs = await vibeQueue.listRecentJobs();
    return NextResponse.json({ success: true, jobs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, jobId } = body;

    if (action === 'reprocess') {
      await vibeQueue.updateJob(jobId, {
        status: 'QUEUED',
        attempts: 0,
        error: undefined,
      });
      return NextResponse.json({ success: true, message: 'Job re-enqueued for processing' });
    }

    if (action === 'cancel') {
      await vibeQueue.updateJob(jobId, {
        status: 'CANCELLED',
      });
      return NextResponse.json({ success: true, message: 'Job cancelled' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
