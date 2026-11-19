import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// In-process idempotency cache complementing Firestore stripe_events
const processedStripeEventIds = new Set<string>();

function verifyStripeSignature(
  payload: string,
  sigHeader: string | null,
  secret: string
): boolean {
  if (!sigHeader) return false;
  const parts = sigHeader.split(',').reduce<Record<string, string>>((acc, item) => {
    const [k, v] = item.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expected, 'utf8')
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    const sigHeader = req.headers.get('stripe-signature');

    if (webhookSecret) {
      const valid = verifyStripeSignature(rawBody, sigHeader, webhookSecret);
      if (!valid) {
        return NextResponse.json(
          { success: false, error: 'Invalid Stripe webhook signature.' },
          { status: 400 }
        );
      }
    }

    let event: {
      id?: string;
      type?: string;
      data?: {
        object?: {
          id?: string;
          client_reference_id?: string;
          amount_total?: number;
          metadata?: Record<string, string>;
        };
      };
    };

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const eventId = typeof event?.id === 'string' ? event.id.trim() : '';
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Missing Stripe event id.' },
        { status: 400 }
      );
    }

    if (processedStripeEventIds.has(eventId)) {
      return NextResponse.json({
        received: true,
        duplicate: true,
        eventId,
        status: 'ALREADY_PROCESSED',
      });
    }

    processedStripeEventIds.add(eventId);

    const sessionObj = event.data?.object;
    const userId =
      sessionObj?.metadata?.userId || sessionObj?.client_reference_id || 'unknown';
    const plan = sessionObj?.metadata?.plan || 'STARTER';
    const credits = Number(sessionObj?.metadata?.credits || (plan === 'PRO' ? 500 : 100));
    const amountUsd =
      typeof sessionObj?.amount_total === 'number'
        ? sessionObj.amount_total / 100
        : plan === 'PRO'
        ? 15
        : 5;

    return NextResponse.json({
      received: true,
      duplicate: false,
      eventId,
      eventType: event.type || 'unknown',
      fulfillment: {
        collection: 'stripe_events',
        userId,
        plan,
        credits,
        amountUsd,
        status: event.type === 'checkout.session.completed' ? 'CREDITED' : 'LOGGED',
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Stripe webhook processing error.',
      },
      { status: 500 }
    );
  }
}
