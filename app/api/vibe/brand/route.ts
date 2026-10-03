export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { vibeService } from '@/lib/vibe/vibeService';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  try {
    let profile = await vibeService.getBrandProfile(userId);
    if (!profile) {
      profile = await vibeService.saveBrandProfile(userId, {
        brandName: 'Nisar AI Studio',
        style: 'Friendly',
        customDescription: 'A modern, empowering, and helpful AI SaaS platform guiding entrepreneurs and creators.',
        primaryLanguage: 'English',
        allowedLanguages: ['English', 'Urdu', 'Roman Urdu', 'Hindi', 'Arabic'],
        responseLength: 'medium',
        emojiUsage: 'minimal',
        formality: 'balanced',
        callToActionStyle: 'Soft invitation to explore Nisar AI Studio features',
        forbiddenWords: ['cheap', 'guarantee 100%', 'free forever'],
        requiredPhrases: ['Nisar AI Studio'],
        businessInfo: 'Nisar AI Studio Super AI Toolbox offers complete full-stack AI website building, social media automation, content generation, and multi-agent workflows.',
      });
    }
    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  try {
    const body = await req.json();
    const profile = await vibeService.saveBrandProfile(userId, body);
    await vibeService.logAudit(userId, {
      action: 'UPDATE_BRAND_PROFILE',
      details: `Updated brand voice profile for ${profile.brandName}`,
      status: 'SUCCESS',
    });
    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
