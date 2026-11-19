import { NextRequest, NextResponse } from 'next/server';
import { BILLING_PLANS, SITE_URL } from '@/lib/seo/site-config';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const planKey = body?.plan === 'pro' ? 'pro' : 'starter';
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authenticated userId is required to initiate Stripe checkout.' },
        { status: 400 }
      );
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeSecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            'STRIPE_SECRET_KEY is not configured on the server. Add STRIPE_SECRET_KEY to enable live USD card checkout, or use JazzCash / Easypaisa (0323-5052148).',
        },
        { status: 503 }
      );
    }

    const selected = BILLING_PLANS[planKey];
    const unitAmountCents = selected.priceUsd * 100;
    const origin = req.headers.get('origin') || SITE_URL;

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${origin}/?billing=success&plan=${selected.id}`);
    params.append('cancel_url', `${origin}/?billing=cancelled`);
    params.append('client_reference_id', userId);
    if (email) params.append('customer_email', email);
    params.append('metadata[userId]', userId);
    params.append('metadata[plan]', selected.id);
    params.append('metadata[credits]', String(selected.credits));
    params.append('line_items[0][quantity]', '1');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][unit_amount]', String(unitAmountCents));
    params.append(
      'line_items[0][price_data][product_data][name]',
      `NISAR AI STUDIO — ${selected.name} (${selected.credits} Credits)`
    );
    params.append(
      'line_items[0][price_data][product_data][description]',
      'Super AI Toolbox priority credits for Search & Auto-Collect and Agent Evolver.'
    );

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok || !session?.url) {
      return NextResponse.json(
        {
          success: false,
          error: session?.error?.message || 'Stripe rejected the checkout session request.',
        },
        { status: stripeRes.status >= 400 ? stripeRes.status : 502 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      plan: selected.id,
      amountUsd: selected.priceUsd,
      credits: selected.credits,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to initiate Stripe checkout.',
      },
      { status: 500 }
    );
  }
}
