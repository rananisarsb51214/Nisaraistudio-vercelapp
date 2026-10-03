export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { vibeService } from '@/lib/vibe/vibeService';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  try {
    let rules = await vibeService.getRules(userId);

    if (rules.length === 0) {
      // Seed default rules if empty
      const defaultRules = [
        {
          name: 'Pricing Inquiries Auto-Draft',
          enabled: true,
          platforms: ['instagram' as const, 'facebook' as const, 'youtube' as const],
          triggers: {
            event: 'NEW_COMMENT' as const,
            keywords: ['price', 'cost', 'how much', 'kya rate hai', 'kitnay ka hai'],
            minConfidence: 0.8,
          },
          actions: {
            type: 'GENERATE_REPLY' as const,
          }
        },
        {
          name: 'High Confidence Auto-Reply',
          enabled: true,
          platforms: ['instagram' as const, 'tiktok' as const, 'linkedin' as const],
          triggers: {
            event: 'NEW_COMMENT' as const,
            keywords: ['thanks', 'great', 'awesome', 'amazing', 'love this'],
            sentiments: ['positive' as const],
            minConfidence: 0.9,
          },
          actions: {
            type: 'AUTO_SEND' as const,
          }
        },
        {
          name: 'Payment & Dispute Escalation',
          enabled: true,
          platforms: ['facebook' as const, 'instagram' as const, 'linkedin' as const],
          triggers: {
            event: 'NEW_DM' as const,
            keywords: ['refund', 'double charge', 'lawyer', 'scam', 'police', 'dispute'],
            sentiments: ['negative' as const, 'urgent' as const],
          },
          actions: {
            type: 'ESCALATE' as const,
            targetTag: 'Urgent Dispute',
          }
        }
      ];

      for (const r of defaultRules) {
        await vibeService.saveRule(userId, r);
      }
      rules = await vibeService.getRules(userId);
    }

    return NextResponse.json({ success: true, rules });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  try {
    const body = await req.json();
    const rule = await vibeService.saveRule(userId, body);
    await vibeService.logAudit(userId, {
      action: 'SAVE_AUTOMATION_RULE',
      details: `Saved automation rule "${rule.name}"`,
      status: 'SUCCESS',
    });
    return NextResponse.json({ success: true, rule });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  const { searchParams } = new URL(req.url);
  const ruleId = searchParams.get('id');

  if (!ruleId) {
    return NextResponse.json({ success: false, error: 'Missing rule ID' }, { status: 400 });
  }

  try {
    await vibeService.deleteRule(userId, ruleId);
    await vibeService.logAudit(userId, {
      action: 'DELETE_AUTOMATION_RULE',
      details: `Deleted rule ${ruleId}`,
      status: 'SUCCESS',
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
