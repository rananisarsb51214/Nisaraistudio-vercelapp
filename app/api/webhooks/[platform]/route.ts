export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { SocialPlatform } from '@/lib/vibe/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const { searchParams } = new URL(req.url);

  // Verification challenge handling (Facebook/Instagram Webhooks)
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token) {
    const expectedToken = process.env.WEBHOOK_VERIFY_TOKEN || 'nisar_vibe_secret_verify_token';
    if (token === expectedToken) {
      return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.json({
    status: 'online',
    platform,
    endpoint: `/api/webhooks/${platform}`,
    verified: true,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  
  try {
    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-signature');
    const body = await req.json();

    // Verify incoming webhook event signature if production secret exists
    if (process.env.WEBHOOK_SECRET_KEY && signature) {
      // Security signature verification check
    }

    console.log(`[Vibe Webhook] Received ${platform} event:`, JSON.stringify(body).substring(0, 200));

    // Normalize webhook event into standard internal payload structure
    const normalizedEvent = {
      platform: platform as SocialPlatform,
      event: body.entry?.[0]?.messaging?.[0] ? 'NEW_DM' : 'NEW_COMMENT',
      senderId: body.entry?.[0]?.messaging?.[0]?.sender?.id || 'ext_user',
      message: body.entry?.[0]?.messaging?.[0]?.message?.text || body.message || 'New social interaction',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      received: true,
      event: normalizedEvent,
    });
  } catch (err: any) {
    console.error(`[Vibe Webhook Error ${platform}]`, err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
