export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { vibeService } from '@/lib/vibe/vibeService';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') || 'All';
  const conversationId = searchParams.get('conversationId');

  try {
    if (conversationId) {
      const messages = await vibeService.getMessages(conversationId);
      return NextResponse.json({ success: true, messages });
    }

    let conversations = await vibeService.getConversations(userId, filter);

    // Seed mock initial conversations if empty for demo/testing
    if (conversations.length === 0) {
      const mockConvs = [
        {
          id: 'conv_demo_1',
          userId,
          accountId: 'ig_biz_1',
          platform: 'instagram' as const,
          username: 'zahra_designs',
          userAvatar: 'https://picsum.photos/seed/zahra/100/100',
          lastMessage: 'Price kya hai Nisar AI Studio full package ka?',
          timestamp: new Date().toISOString(),
          sentiment: 'positive' as const,
          priority: 'medium' as const,
          status: 'AI_DRAFT' as const,
          aiSuggestedReply: 'Nisar AI Studio Super AI Toolbox key pricing detail hamaray official store per Rs. 4,999/month se start hoti hai. Kya aap custom plan details dekhna chahtay hain?',
          aiConfidence: 0.92,
          aiReasoning: 'Standard product pricing inquiry automatically matched with Brand Voice in Roman Urdu.',
          intent: 'price_inquiry',
          language: 'Roman Urdu',
          shouldEscalate: false,
          unread: true,
          tags: ['Pricing', 'Lead'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'conv_demo_2',
          userId,
          accountId: 'fb_page_1',
          platform: 'facebook' as const,
          username: 'Muhammad Usman',
          userAvatar: 'https://picsum.photos/seed/usman/100/100',
          lastMessage: 'My payment was deducted twice! Please refund immediately or I will take legal action.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          sentiment: 'urgent' as const,
          priority: 'urgent' as const,
          status: 'ESCALATED' as const,
          aiSuggestedReply: 'We sincerely apologize for the inconvenience. I have escalated your dispute to our billing specialists for an immediate priority refund review.',
          aiConfidence: 0.42,
          aiReasoning: 'Flagged for Human Escalation due to risk triggers: Payment dispute & legal threat.',
          intent: 'payment_dispute',
          language: 'English',
          shouldEscalate: true,
          escalationReason: 'Risk Trigger: Payment dispute & Legal action threat.',
          unread: true,
          tags: ['Dispute', 'Billing'],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'conv_demo_3',
          userId,
          accountId: 'yt_chan_1',
          platform: 'youtube' as const,
          username: 'CodeWithHamza',
          userAvatar: 'https://picsum.photos/seed/hamza/100/100',
          lastMessage: 'Loved the Vibe Responding tutorial! Does it integrate with custom Gemini models?',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          sentiment: 'positive' as const,
          priority: 'low' as const,
          status: 'SENT' as const,
          aiSuggestedReply: 'Thank you so much! Yes, Vibe Responding uses Gemini 3.5 Flash server-side with custom system prompts and brand voices.',
          aiConfidence: 0.98,
          aiReasoning: 'High confidence product question auto-replied.',
          intent: 'product_question',
          language: 'English',
          shouldEscalate: false,
          unread: false,
          tags: ['Feedback'],
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      for (const c of mockConvs) {
        await vibeService.saveConversation(userId, c);
      }
      conversations = await vibeService.getConversations(userId, filter);
    }

    return NextResponse.json({ success: true, conversations });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'demo_user';
  try {
    const body = await req.json();
    const { action, conversationId, status, replyText, messageText } = body;

    if (action === 'update_status') {
      await vibeService.updateConversationStatus(conversationId, status);
      await vibeService.logAudit(userId, {
        action: 'UPDATE_CONVERSATION_STATUS',
        details: `Updated conversation ${conversationId} status to ${status}`,
        conversationId,
        status: 'SUCCESS',
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'add_user_message') {
      const msg = await vibeService.addMessage({
        conversationId,
        senderId: 'customer_1',
        senderName: 'Customer',
        isFromUser: false,
        content: messageText,
        timestamp: new Date().toISOString(),
      });

      await vibeService.saveConversation(userId, {
        id: conversationId,
        lastMessage: messageText,
        timestamp: new Date().toISOString(),
        unread: true,
        status: 'NEW',
      });

      return NextResponse.json({ success: true, message: msg });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
