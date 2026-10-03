import { GoogleGenAI, Type } from '@google/genai';
import { AIReplyResult, BrandProfile, SocialPlatform } from './types';

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[Vibe Gemini] GEMINI_API_KEY environment variable is missing.');
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiInstance;
}

export interface GenerateReplyInput {
  platform: SocialPlatform;
  message: string;
  conversationHistory?: Array<{ sender: string; text: string }>;
  postContext?: string;
  brandProfile?: Partial<BrandProfile>;
  businessInfo?: string;
  responseGoal?: string;
}

const SYSTEM_INSTRUCTION = `
You are the Vibe Responding AI for Nisar AI Studio.
Your job is to help businesses respond to legitimate customer messages, comments, and inquiries on social media.

Rules:
1. Understand the user's intent, sentiment, and emotion.
2. Respect the configured brand voice (style, length, emoji usage, formality, tone).
3. Reply naturally, warmly, and helpfully in a single coherent message.
4. Keep replies concise unless detailed technical explanation is required.
5. Match the incoming language automatically (e.g. English, Urdu, Roman Urdu, Hindi, Arabic).
6. NEVER invent prices, policies, features, guarantees, or false facts.
7. NEVER impersonate a human when disclosure is required or asked directly.
8. NEVER answer sensitive, threatening, or high-risk messages without flagging for human escalation.
9. Automatically detect risk triggers (threats, legal complaints, payment disputes, account security issues, explicit human request).
10. Return a valid JSON object matching the exact schema required.
`;

function parseGeminiJson(responseText: string): AIReplyResult {
  if (!responseText) {
    throw new Error('Empty response text from Gemini');
  }

  // 1. Remove markdown code blocks if present
  let cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

  // 2. Extract JSON object substring
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 3. First attempt: standard JSON parse
  try {
    return JSON.parse(cleaned) as AIReplyResult;
  } catch {
    // 4. Second attempt: repair unescaped newlines or control characters inside JSON strings
    try {
      const repaired = cleaned
        .replace(/[\u0000-\u001F]+/g, (match) => {
          if (match === '\n') return '\\n';
          if (match === '\r') return '\\r';
          if (match === '\t') return '\\t';
          return '';
        });
      return JSON.parse(repaired) as AIReplyResult;
    } catch (secondErr) {
      console.warn('[Vibe Gemini] JSON repair failed:', secondErr);
      throw secondErr;
    }
  }
}

export async function generateVibeReply(input: GenerateReplyInput): Promise<AIReplyResult> {
  const ai = getGeminiClient();

  const brandVoice = input.brandProfile || {};
  const style = brandVoice.style || 'Friendly';
  const customDesc = brandVoice.customDescription || '';
  const businessInfo = input.businessInfo || brandVoice.businessInfo || 'Nisar AI Studio - AI SaaS Application Platform.';
  const forbiddenWords = (brandVoice.forbiddenWords || []).join(', ');
  const requiredPhrases = (brandVoice.requiredPhrases || []).join(', ');
  const length = brandVoice.responseLength || 'short';
  const emoji = brandVoice.emojiUsage || 'minimal';
  const formality = brandVoice.formality || 'balanced';

  const userPrompt = `
Analyze and generate an appropriate social media response:

PLATFORM: ${input.platform}
CUSTOMER MESSAGE: "${input.message}"
POST CONTEXT: "${input.postContext || 'General post / Direct Message'}"

CONVERSATION HISTORY:
${(input.conversationHistory || []).map(h => `${h.sender}: ${h.text}`).join('\n') || 'None'}

BUSINESS CONTEXT:
${businessInfo}

BRAND VOICE CONTROL:
- Style: ${style} (${customDesc})
- Response Length: ${length}
- Emoji Usage: ${emoji}
- Formality: ${formality}
- Forbidden Words: ${forbiddenWords || 'None'}
- Required Phrases: ${requiredPhrases || 'None'}

Generate a JSON object with keys:
- reply: string
- intent: "product_question" | "price_inquiry" | "praise" | "complaint" | "support_request" | "greeting" | "unknown"
- sentiment: "positive" | "neutral" | "negative" | "urgent"
- confidence: number (0.0 to 1.0)
- shouldEscalate: boolean
- reason: string
- suggestedActions: array of strings
- detectedLanguage: string
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            intent: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            shouldEscalate: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            detectedLanguage: { type: Type.STRING }
          },
          required: ['reply', 'intent', 'sentiment', 'confidence', 'shouldEscalate', 'reason', 'suggestedActions', 'detectedLanguage']
        }
      },
    });

    const responseText = response.text || '';
    const parsed = parseGeminiJson(responseText);

    // Hard safety check override for high-risk trigger phrases
    const lowerMessage = input.message.toLowerCase();
    const riskPhrases = [
      'sue', 'lawyer', 'legal', 'scam', 'fraud', 'police',
      'refund money', 'stolen', 'hack', 'hacked', 'threat', 'human support', 'agent please',
      'talk to human', 'manager', 'dispute'
    ];

    const containsRisk = riskPhrases.some(phrase => lowerMessage.includes(phrase));

    if (containsRisk) {
      return {
        ...parsed,
        shouldEscalate: true,
        confidence: Math.min(parsed.confidence, 0.4),
        reason: 'Flagged for human review due to sensitive or high-risk key phrases (Legal, Payment, Fraud, or Explicit Human request).',
        sentiment: parsed.sentiment === 'positive' ? 'urgent' : parsed.sentiment,
      };
    }

    return parsed;
  } catch (err: any) {
    console.error('[Vibe Gemini Engine Error]', err.message);

    // Resilient fallback when Gemini API call fails or is unreachable
    return {
      reply: 'Thank you for contacting us! We have received your message and our team will get back to you shortly.',
      intent: 'unknown',
      sentiment: 'neutral',
      confidence: 0.5,
      shouldEscalate: true,
      reason: `AI generation experienced temporary error: ${err.message || 'Unknown error'}`,
      suggestedActions: ['Manual review required', 'Check API configuration'],
      detectedLanguage: 'English'
    };
  }
}
