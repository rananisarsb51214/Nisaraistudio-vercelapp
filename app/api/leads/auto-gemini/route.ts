export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createGeminiClient, parseGeminiError } from '@/lib/ai/gemini-error';
import type { LeadLabel } from '@/types/leads';

const HOT_CITIES = ['lahore', 'karachi', 'islamabad'];

function classifyLeadCity(city: string): LeadLabel {
  const normalized = city.trim().toLowerCase();
  return HOT_CITIES.some((hot) => normalized.includes(hot)) ? 'HOT' : 'COLD';
}

export async function POST(req: NextRequest) {
  let resolvedLeadId = '';
  let resolvedCity = '';
  let computedLabel: LeadLabel = 'COLD';

  try {
    const body = await req.json();
    const {
      leadId = '',
      naam = '',
      phoneNumber = '',
      city = '',
      saveToFirestore = true,
    } = body || {};

    resolvedLeadId = typeof leadId === 'string' ? leadId.trim() : '';
    const cleanNaam = typeof naam === 'string' ? naam.trim().slice(0, 100) : '';
    const cleanPhone = typeof phoneNumber === 'string' ? phoneNumber.trim().slice(0, 30) : '';
    resolvedCity = typeof city === 'string' ? city.trim().slice(0, 80) : '';

    if (!cleanNaam || !resolvedCity) {
      return NextResponse.json(
        { success: false, error: 'Lead naam and city are required.' },
        { status: 400 }
      );
    }

    computedLabel = classifyLeadCity(resolvedCity);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const missingMsg = 'GEMINI_API_KEY is not configured on the server.';
      if (saveToFirestore && resolvedLeadId && db) {
        await updateDoc(doc(db, 'leads', resolvedLeadId), {
          leadLabel: computedLabel,
          aiStatus: 'error',
          aiError: missingMsg,
          aiProcessedAt: serverTimestamp(),
        }).catch(() => {});
      }
      return NextResponse.json(
        {
          success: false,
          code: 'API_KEY_MISSING',
          leadLabel: computedLabel,
          error: missingMsg,
        },
        { status: 500 }
      );
    }

    const ai = createGeminiClient(apiKey);
    const prompt = `You are a helpful Pakistani sales assistant for NISAR AI Studio.
Read this new lead and generate a JSON object:
- Name (Naam): ${cleanNaam}
- Phone Number: ${cleanPhone || 'N/A'}
- City: ${resolvedCity}

Strict instructions:
1. "leadLabel": Return "HOT" if the city is Lahore, Karachi, or Islamabad (case-insensitive); otherwise return "COLD".
2. "whatsappReply": Write a short, warm, friendly WhatsApp reply in Roman Urdu (2-3 short sentences max, under 350 characters) starting naturally like: "Assalam-o-Alaikum ${cleanNaam} bhai, aapka Free Offer mil gaya hai..." and mentioning their city (${resolvedCity}) and that the team will contact them shortly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            leadLabel: {
              type: Type.STRING,
              enum: ['HOT', 'COLD'],
            },
            whatsappReply: {
              type: Type.STRING,
            },
          },
          required: ['leadLabel', 'whatsappReply'],
        },
      },
    });

    const parsedJson = JSON.parse((response.text || '{}').trim());
    const finalLabel: LeadLabel = computedLabel;
    const whatsappReply =
      typeof parsedJson.whatsappReply === 'string' && parsedJson.whatsappReply.trim()
        ? parsedJson.whatsappReply.trim().slice(0, 600)
        : `Assalam-o-Alaikum ${cleanNaam} bhai, aapka Free Offer mil gaya hai. Hamari team ${resolvedCity} ke liye jald rabta karegi.`;

    if (saveToFirestore && resolvedLeadId && db) {
      await updateDoc(doc(db, 'leads', resolvedLeadId), {
        leadLabel: finalLabel,
        whatsappReply,
        aiStatus: 'completed',
        aiModel: 'gemini-4-hydrogen',
        aiError: '',
        aiProcessedAt: serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      leadId: resolvedLeadId,
      leadLabel: finalLabel,
      whatsappReply,
      aiModel: 'gemini-4-hydrogen',
    });
  } catch (error: unknown) {
    const parsed = parseGeminiError(error);
    console.warn('[API /api/leads/auto-gemini Error]:', parsed.code, parsed.message);

    if (resolvedLeadId && db) {
      await updateDoc(doc(db, 'leads', resolvedLeadId), {
        leadLabel: computedLabel,
        aiStatus: 'error',
        aiError: parsed.message.slice(0, 300),
        aiProcessedAt: serverTimestamp(),
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        success: false,
        code: parsed.code,
        leadLabel: computedLabel,
        error: parsed.message,
      },
      { status: parsed.status }
    );
  }
}
