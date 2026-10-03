export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { vibeService } from '@/lib/vibe/vibeService';
import { vibeQueue } from '@/lib/vibe/redisQueue';
import { getPlatformAdapter } from '@/lib/vibe/adapters';
import { SocialPlatform } from '@/lib/vibe/types';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  try {
    const body = await req.json();
    const { conversationId, platform, accountId, replyText } = body;

    if (!conversationId || !replyText) {
      return NextResponse.json({ success: false, error: 'conversationId and replyText required' }, { status: 400 });
    }

    const plat = (platform || 'instagram') as SocialPlatform;
    const accId = accountId || `${plat}_acc_default`;

    // 1. Acquire distributed lock for conversation via Redis
    const lockAcquired = await vibeQueue.acquireLock(conversationId, 15);
    if (!lockAcquired) {
      return NextResponse.json({ success: false, error: 'Another reply operation is in progress for this conversation' }, { status: 429 });
    }

    try {
      // 2. Check rate limit via Redis
      const rateCheck = await vibeQueue.checkRateLimit(plat, accId, 60, 3600);
      if (!rateCheck.allowed) {
        return NextResponse.json({ success: false, error: 'Rate limit exceeded for this social account. Try again later.' }, { status: 429 });
      }

      // 3. Enqueue job into Redis Content Queue
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await vibeQueue.enqueueJob({
        id: jobId,
        userId,
        platform: plat,
        accountId: accId,
        conversationId,
        replyText,
        status: 'PROCESSING',
        priority: 'high',
        attempts: 1,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        scheduledAt: new Date().toISOString(),
      });

      // 4. Send reply using platform adapter
      const adapter = getPlatformAdapter(plat);
      const sendResult = await adapter.sendReply({
        accountId: accId,
        conversationId,
        replyText,
      });

      if (!sendResult.success) {
        await vibeQueue.updateJob(jobId, {
          status: 'FAILED',
          error: sendResult.error || 'Failed to send reply via social API',
        });
        await vibeService.updateConversationStatus(conversationId, 'FAILED');
        return NextResponse.json({ success: false, error: sendResult.error || 'Send failed' }, { status: 500 });
      }

      // 5. Update job status in Redis queue
      await vibeQueue.updateJob(jobId, {
        status: 'COMPLETED',
        processedAt: new Date().toISOString(),
      });

      // 6. Update Firestore conversation & message history
      await vibeService.updateConversationStatus(conversationId, 'SENT', {
        aiSuggestedReply: replyText,
        unread: false,
      });

      await vibeService.addMessage({
        conversationId,
        senderId: 'ai_bot',
        senderName: 'Vibe Responding AI',
        isFromUser: true,
        content: replyText,
        timestamp: new Date().toISOString(),
      });

      await vibeService.logAudit(userId, {
        action: 'SEND_REPLY',
        details: `Published reply on ${plat} for conversation ${conversationId}: "${replyText.substring(0, 50)}..."`,
        conversationId,
        platform: plat,
        status: 'SUCCESS',
      });

      return NextResponse.json({
        success: true,
        messageId: sendResult.messageId || `msg_${Date.now()}`,
        jobId,
      });
    } finally {
      await vibeQueue.releaseLock(conversationId);
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
