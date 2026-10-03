export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { vibeService } from '@/lib/vibe/vibeService';
import { getPlatformAdapter } from '@/lib/vibe/adapters';
import { SocialPlatform } from '@/lib/vibe/types';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  try {
    const accounts = await vibeService.getAccounts(userId);
    return NextResponse.json({ success: true, accounts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  try {
    const body = await req.json();
    const { action, platform, accountId, code, redirectUri } = body;

    if (action === 'get_auth_url') {
      const adapter = getPlatformAdapter(platform as SocialPlatform);
      const authUrl = adapter.getAuthUrl(redirectUri || 'https://nisaraistudiovercel-app.vercel.app/api/vibe/accounts/callback', `state_${Date.now()}`);
      return NextResponse.json({ success: true, authUrl });
    }

    if (action === 'connect') {
      const adapter = getPlatformAdapter(platform as SocialPlatform);
      const oauthResult = await adapter.handleOAuthCallback(code || 'sim_code', redirectUri || 'https://nisaraistudiovercel-app.vercel.app/api/vibe/accounts/callback');
      
      const newAccount = await vibeService.saveAccount(userId, {
        platform: platform as SocialPlatform,
        accountName: oauthResult.accountName,
        avatarUrl: oauthResult.avatarUrl,
        status: 'CONNECTED',
        automationStatus: 'ACTIVE',
        lastSyncAt: new Date().toISOString(),
        accessToken: oauthResult.accessToken,
      });

      await vibeService.logAudit(userId, {
        action: 'CONNECT_ACCOUNT',
        details: `Connected social account: ${newAccount.accountName} (${platform})`,
        platform: platform as SocialPlatform,
        status: 'SUCCESS',
      });

      return NextResponse.json({ success: true, account: newAccount });
    }

    if (action === 'test_connection') {
      const accounts = await vibeService.getAccounts(userId);
      const target = accounts.find(a => a.id === accountId);
      if (!target) {
        return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
      }

      const adapter = getPlatformAdapter(target.platform);
      const testResult = await adapter.testConnection(target.id, target.accessToken);

      await vibeService.logAudit(userId, {
        action: 'TEST_CONNECTION',
        details: `Tested connection for ${target.accountName}: ${testResult.message}`,
        platform: target.platform,
        status: testResult.success ? 'SUCCESS' : 'WARNING',
      });

      return NextResponse.json({ success: true, testResult });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('id');

  if (!accountId) {
    return NextResponse.json({ success: false, error: 'Missing account ID' }, { status: 400 });
  }

  try {
    await vibeService.deleteAccount(userId, accountId);
    await vibeService.logAudit(userId, {
      action: 'DISCONNECT_ACCOUNT',
      details: `Disconnected account ${accountId}`,
      status: 'SUCCESS',
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
