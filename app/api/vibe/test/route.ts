export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { generateVibeReply } from '@/lib/vibe/geminiEngine';
import { vibeService } from '@/lib/vibe/vibeService';
import { SocialPlatform } from '@/lib/vibe/types';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  try {
    const body = await req.json();
    const { platform, message, customBrandVoice, postContext } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: 'Customer message is required' }, { status: 400 });
    }

    const savedProfile = await vibeService.getBrandProfile(userId) || undefined;

    const brandProfile = customBrandVoice 
      ? { ...savedProfile, customDescription: customBrandVoice, style: 'Custom' as const }
      : savedProfile;

    const result = await generateVibeReply({
      platform: (platform || 'instagram') as SocialPlatform,
      message,
      postContext,
      brandProfile,
    });

    await vibeService.logAudit(userId, {
      action: 'VIBE_SIMULATOR_TEST',
      details: `Tested simulator message on ${platform || 'instagram'}: "${message.substring(0, 40)}"`,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      result,
      simulatorMode: true,
      note: 'Test mode — no external social media post was published.'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
