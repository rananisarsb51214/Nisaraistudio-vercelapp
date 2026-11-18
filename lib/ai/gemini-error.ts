import { GoogleGenAI } from '@google/genai';

export interface ParsedGeminiError {
  status: number;
  code: string;
  message: string;
}

const DEFAULT_GEMINI_MODEL = 'gemini-4-hydrogen';

const LEGACY_MODEL_MAP: Record<string, string> = {
  'gemini-3.5-flash': 'gemini-4-hydrogen',
  'gemini-3.5-flash-lite': 'gemini-3.1-flash-lite',
  'gemini-3.5-pro': 'gemini-4-argon',
  'gemini-2.5-flash': 'gemini-4-hydrogen',
  'gemini-2.5-pro': 'gemini-4-argon',
  'gemini-1.5-flash': 'gemini-4-hydrogen',
  'gemini-1.5-pro': 'gemini-4-argon',
  'gemini-2.0-flash': 'gemini-4-hydrogen',
  'gemini-2.0-pro': 'gemini-4-argon',
  'gemini-pro': 'gemini-4-hydrogen',
};

export function resolveGeminiModel(requestedModel?: string | null): string {
  if (!requestedModel || typeof requestedModel !== 'string') {
    return DEFAULT_GEMINI_MODEL;
  }
  const trimmed = requestedModel.trim();
  if (!trimmed) return DEFAULT_GEMINI_MODEL;
  return LEGACY_MODEL_MAP[trimmed] || trimmed;
}

export function supportsSamplingTemperature(model: string): boolean {
  return !model.startsWith('gemini-4-');
}

export function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function tryParseJson(input: string): Record<string, any> | null {
  try {
    const parsed = JSON.parse(input);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function parseGeminiError(error: unknown): ParsedGeminiError {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : 'Gemini API request failed.';

  let status = 500;
  let code = 'GEMINI_ERROR';
  let message = rawMessage;

  // Unwrap up to 2 levels of JSON-encoded Google API error payloads
  let current: any = tryParseJson(rawMessage);
  for (let i = 0; i < 2 && current; i++) {
    const nested = current.error || current;
    if (typeof nested === 'string') {
      message = nested;
      current = tryParseJson(nested);
      continue;
    }
    if (nested && typeof nested === 'object') {
      if (typeof nested.code === 'number') status = nested.code;
      if (typeof nested.status === 'string') code = nested.status;
      if (Array.isArray(nested.details)) {
        const reasonDetail = nested.details.find((d: any) => typeof d?.reason === 'string');
        if (reasonDetail?.reason) code = reasonDetail.reason;
      }
      if (typeof nested.message === 'string') {
        message = nested.message;
        const inner = tryParseJson(nested.message);
        if (inner) {
          current = inner;
          continue;
        }
      }
    }
    break;
  }

  if (
    code === 'API_KEY_INVALID' ||
    rawMessage.includes('API_KEY_INVALID') ||
    message.toLowerCase().includes('api key not valid')
  ) {
    return {
      status: 400,
      code: 'API_KEY_INVALID',
      message:
        'The configured GEMINI_API_KEY was rejected by Google Gemini (API_KEY_INVALID). Check or replace the active key in AI Studio Settings > Secrets.',
    };
  }

  if (status === 429 || code === 'RESOURCE_EXHAUSTED') {
    return {
      status: 429,
      code: 'RATE_LIMITED',
      message: 'Gemini API rate limit or quota exceeded. Please try again shortly.',
    };
  }

  return {
    status: status >= 400 && status < 600 ? status : 500,
    code,
    message,
  };
}
