export type SocialPlatform = 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin';

export type ConversationStatus = 
  | 'NEW'
  | 'AI_DRAFT'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'ESCALATED'
  | 'FAILED'
  | 'RESOLVED';

export type AutomationMode = 'AUTO' | 'APPROVAL' | 'HYBRID';

export type BrandVoiceStyle = 
  | 'Professional'
  | 'Friendly'
  | 'Casual'
  | 'Expert'
  | 'Minimal'
  | 'Funny'
  | 'Premium'
  | 'Custom';

export interface SocialAccount {
  id: string;
  userId: string;
  platform: SocialPlatform;
  accountName: string;
  avatarUrl?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'ERROR';
  automationStatus: 'ACTIVE' | 'PAUSED';
  lastSyncAt: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isFromUser: boolean;
  content: string;
  timestamp: string;
  platformMessageId?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  accountId: string;
  platform: SocialPlatform;
  username: string;
  userAvatar?: string;
  lastMessage: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: ConversationStatus;
  aiSuggestedReply?: string;
  aiConfidence?: number;
  aiReasoning?: string;
  intent?: string;
  language?: string;
  shouldEscalate?: boolean;
  escalationReason?: string;
  postContext?: string;
  unread: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRule {
  id: string;
  userId: string;
  name: string;
  enabled: boolean;
  platforms: SocialPlatform[];
  triggers: {
    event: 'NEW_COMMENT' | 'NEW_DM' | 'MENTION';
    keywords?: string[];
    sentiments?: ('positive' | 'neutral' | 'negative' | 'urgent')[];
    intents?: string[];
    minConfidence?: number;
    languages?: string[];
  };
  actions: {
    type: 'GENERATE_REPLY' | 'AUTO_SEND' | 'CREATE_DRAFT' | 'ESCALATE' | 'ADD_TAG';
    targetTag?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BrandProfile {
  userId: string;
  brandName: string;
  style: BrandVoiceStyle;
  customDescription?: string;
  primaryLanguage: string;
  allowedLanguages: string[];
  responseLength: 'short' | 'medium' | 'detailed';
  emojiUsage: 'none' | 'minimal' | 'frequent';
  formality: 'casual' | 'balanced' | 'formal';
  callToActionStyle?: string;
  forbiddenWords: string[];
  requiredPhrases: string[];
  businessInfo: string;
  moderationRules: string[];
  updatedAt: string;
}

export interface AIReplyResult {
  reply: string;
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  confidence: number;
  shouldEscalate: boolean;
  reason: string;
  suggestedActions: string[];
  detectedLanguage?: string;
}

export interface ContentQueueJob {
  id: string;
  userId: string;
  platform: SocialPlatform;
  accountId: string;
  conversationId: string;
  replyText: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  priority: 'low' | 'medium' | 'high';
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  scheduledAt: string;
  processedAt?: string;
  error?: string;
}

export interface VibeSettings {
  userId: string;
  automationStatus: 'ONLINE' | 'PAUSED';
  mode: AutomationMode;
  confidenceThreshold: number; // 0.0 - 1.0 e.g. 0.85
  autoEscalateNegative: boolean;
  notifyOnEscalation: boolean;
  notifyOnFailure: boolean;
  maxRepliesPerDay: number;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  details: string;
  platform?: SocialPlatform;
  conversationId?: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  timestamp: string;
}

export interface VibeNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ESCALATION' | 'LOW_CONFIDENCE' | 'QUEUE_FAILURE' | 'DISCONNECTED';
  read: boolean;
  conversationId?: string;
  createdAt: string;
}
