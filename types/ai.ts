export type ToolCategory = 'content' | 'video' | 'marketing' | 'business' | 'productivity';

export interface ToolFieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'tags' | 'number';
  placeholder?: string;
  defaultValue?: string | number | string[];
  options?: { label: string; value: string }[];
  required?: boolean;
  helpText?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  urduName?: string;
  category: ToolCategory;
  description: string;
  iconName: string;
  badge?: string;
  creditCost: number;
  systemPrompt: string;
  fields: ToolFieldDefinition[];
  defaultModel?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  outputStructure?: {
    sections: { key: string; label: string; type: 'text' | 'list' | 'code' | 'table' }[];
  };
}

export interface ToolExecutionRequest {
  toolId: string;
  userId: string;
  parameters: Record<string, any>;
  model?: string;
  tone?: string;
  language?: string;
}

export interface ToolExecutionResponse {
  success: boolean;
  generationId?: string;
  toolId: string;
  category: ToolCategory;
  output: string;
  structuredOutput?: Record<string, any>;
  creditsUsed: number;
  remainingCredits: number;
  executionTimeMs: number;
  modelUsed: string;
  timestamp: string;
  error?: string;
}
