export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { generateVibeReply } from '@/lib/vibe/geminiEngine';
import { vibeService } from '@/lib/vibe/vibeService';
import { SocialPlatform } from '@/lib/vibe/types';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  try {
    const body = await req.json();
    const { conversationId, platform, message, postContext, conversationHistory } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message text is required' }, { status: 400 });
    }

    // Load user's brand profile & settings
    const brandProfile = await vibeService.getBrandProfile(userId) || undefined;
    const settings = await vibeService.getSettings(userId);

    // Call Gemini Response Engine
    const aiResult = await generateVibeReply({
      platform: (platform || 'instagram') as SocialPlatform,
      message,
      postContext,
      conversationHistory,
      brandProfile,
    });

    // Check hybrid/auto mode confidence threshold
    const effectiveEscalate = aiResult.shouldEscalate || (aiResult.confidence < settings.confidenceThreshold);

    const newStatus = effectiveEscalate 
      ? 'ESCALATED' 
      : (settings.mode === 'AUTO' ? 'APPROVED' : 'AI_DRAFT');

    // Save to Firestore if conversationId provided
    if (conversationId) {
      await vibeService.saveConversation(userId, {
        id: conversationId,
        platform: (platform || 'instagram') as SocialPlatform,
        lastMessage: message,
        sentiment: aiResult.sentiment,
        aiSuggestedReply: aiResult.reply,
        aiConfidence: aiResult.confidence,
        aiReasoning: aiResult.reason,
        intent: aiResult.intent,
        language: aiResult.detectedLanguage,
        shouldEscalate: effectiveEscalate,
        escalationReason: effectiveEscalate ? aiResult.reason : undefined,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      await vibeService.logAudit(userId, {
        action: 'GENERATE_AI_REPLY',
        details: `Generated reply for ${conversationId} (Confidence: ${Math.round(aiResult.confidence * 100)}%, Status: ${newStatus})`,
        conversationId,
        platform: platform as SocialPlatform,
        status: 'SUCCESS',
      });

      if (effectiveEscalate) {
        await vibeService.createNotification(userId, {
          title: 'Human Review Required',
          message: `Conversation flagged (${aiResult.intent}): ${aiResult.reason}`,
          type: 'ESCALATION',
          conversationId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        ...aiResult,
        shouldEscalate: effectiveEscalate,
        assignedStatus: newStatus,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
