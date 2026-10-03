import { ToolDefinition } from '@/types/ai';

export function buildExecutionPrompt(
  tool: ToolDefinition,
  parameters: Record<string, any>,
  options?: { tone?: string; language?: string }
): { systemInstruction: string; userPrompt: string } {
  const systemInstruction = `You are NISAR AI STUDIO — Super AI Toolbox, an elite, production-grade intelligence engine powered by Google Gemini.
Your mission is to deliver comprehensive, actionable, structured, high-conversion, and perfectly crafted output for the requested tool: "${tool.name}" (${tool.category.toUpperCase()}).

CORE OPERATIONAL RULES:
1. Always follow the highest standard of craftsmanship, formatting, typography, and domain-specific excellence.
2. Structure your output logically using Markdown (## Headings, ### Subheadings, bullet points, bold key terms, blockquotes, and tables where appropriate).
3. If the user provided specific parameters, address EVERY parameter thoroughly. Never give truncated or lazy placeholders.
4. Avoid generic fluff or clichéd fillers. Deliver direct, high-value, ready-to-use content.
5. Provide actionable variations or practical tips at the end whenever beneficial.
`;

  let formattedParams = '';
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null && value !== '') {
      formattedParams += `- **${key.toUpperCase()}**: ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
    }
  }

  let userPrompt = `### TOOL EXECUTION REQUEST
**Tool Name**: ${tool.name}
**Tool Category**: ${tool.category}
**Description**: ${tool.description}

### INPUT PARAMETERS:
${formattedParams || 'No specific parameters provided.'}
`;

  if (options?.tone) {
    userPrompt += `\n**Requested Overall Tone**: ${options.tone}`;
  }

  if (options?.language) {
    userPrompt += `\n**Requested Language**: ${options.language}`;
  }

  userPrompt += `\n\nPlease generate the full, complete, high-quality output for this tool now:`;

  return { systemInstruction, userPrompt };
}
