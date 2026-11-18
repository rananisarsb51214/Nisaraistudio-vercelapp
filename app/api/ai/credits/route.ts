export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import {
  adminUpdateUserCredits,
  getUserCredits,
  topUpUserCredits,
} from '@/lib/credits/credits-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default_user';
    const credits = await getUserCredits(userId);

    return NextResponse.json({ success: true, credits });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 'default_user', amount = 50, type = 'bonus', description } = body || {};
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > 100000) {
      return NextResponse.json(
        { success: false, error: 'Invalid credit top-up amount.' },
        { status: 400 }
      );
    }

    const updatedCredits = await topUpUserCredits(userId, numericAmount, type, description);
    return NextResponse.json({ success: true, credits: updatedCredits });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId = 'default_user',
      paidCredits,
      adjustPaidDelta,
      dailyLimit,
      resetDailyUsed,
      tier,
      description,
    } = body || {};

    const validTiers = ['free', 'starter', 'pro', 'enterprise'];
    const updatedCredits = await adminUpdateUserCredits(userId, {
      paidCredits: typeof paidCredits === 'number' ? paidCredits : undefined,
      adjustPaidDelta: typeof adjustPaidDelta === 'number' ? adjustPaidDelta : undefined,
      dailyLimit: typeof dailyLimit === 'number' ? dailyLimit : undefined,
      resetDailyUsed: Boolean(resetDailyUsed),
      tier: validTiers.includes(tier) ? tier : undefined,
      description: typeof description === 'string' ? description.slice(0, 140) : undefined,
    });

    return NextResponse.json({ success: true, credits: updatedCredits });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
