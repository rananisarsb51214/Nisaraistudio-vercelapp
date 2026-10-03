import { ToolCategory } from './ai';

export interface GenerationHistoryItem {
  id: string;
  userId: string;
  toolId: string;
  toolName: string;
  category: ToolCategory;
  promptSummary: string;
  parameters: Record<string, any>;
  output: string;
  structuredOutput?: Record<string, any>;
  modelUsed: string;
  creditsCost: number;
  executionTimeMs: number;
  isFavorite: boolean;
  tags?: string[];
  createdAt: string;
}

export interface GenerationFilter {
  category?: ToolCategory;
  toolId?: string;
  searchQuery?: string;
  onlyFavorites?: boolean;
  limit?: number;
}
