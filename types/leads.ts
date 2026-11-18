export type LeadLabel = 'HOT' | 'COLD';

export type LeadAiStatus = 'pending' | 'completed' | 'error';

export interface LeadRecord {
  id: string;
  naam: string;
  phoneNumber: string;
  city: string;
  source?: string;
  userId?: string;
  aiStatus?: LeadAiStatus;
  leadLabel?: LeadLabel;
  whatsappReply?: string;
  aiModel?: string;
  aiError?: string;
  aiProcessedAt?: unknown;
  createdAt?: unknown;
}
