import { GoogleGenAI } from '@google/genai';
import { AI_TOOLS_REGISTRY } from './schemas';
import { buildExecutionPrompt } from './prompts';
import { ToolExecutionRequest, ToolExecutionResponse } from '@/types/ai';

let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

export async function executeTool(request: ToolExecutionRequest): Promise<{
  output: string;
  toolName: string;
  category: any;
  creditCost: number;
  executionTimeMs: number;
  modelUsed: string;
}> {
  const startTime = Date.now();
  const tool = AI_TOOLS_REGISTRY[request.toolId];

  if (!tool) {
    throw new Error(`Invalid tool ID: "${request.toolId}". Tool is not registered in Super AI Toolbox.`);
  }

  // Validate required fields
  for (const field of tool.fields) {
    if (field.required && !request.parameters[field.name]) {
      throw new Error(`Field "${field.label}" is required.`);
    }
  }

  const ai = getGemini();
  const modelToUse = request.model || tool.defaultModel || 'gemini-2.5-flash';
  const { systemInstruction, userPrompt } = buildExecutionPrompt(
    tool,
    request.parameters,
    { tone: request.tone, language: request.language }
  );

  const response = await ai.models.generateContent({
    model: modelToUse,
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  const outputText = response.text || '';
  const executionTimeMs = Date.now() - startTime;

  return {
    output: outputText,
    toolName: tool.name,
    category: tool.category,
    creditCost: tool.creditCost,
    executionTimeMs,
    modelUsed: modelToUse,
  };
}
