import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, Timestamp 
} from 'firebase/firestore';
import { 
  SocialAccount, Conversation, ConversationMessage, AutomationRule, 
  BrandProfile, VibeSettings, AuditLogEntry, VibeNotification, SocialPlatform 
} from './types';

// Collections
const COLLECTIONS = {
  ACCOUNTS: 'vibe_accounts',
  CONVERSATIONS: 'vibe_conversations',
  MESSAGES: 'vibe_messages',
  RULES: 'vibe_rules',
  BRAND_PROFILES: 'vibe_brand_profiles',
  SETTINGS: 'vibe_settings',
  AUDIT_LOGS: 'vibe_audit_logs',
  NOTIFICATIONS: 'vibe_notifications',
};

export const vibeService = {
  // --- SOCIAL ACCOUNTS ---
  async getAccounts(userId: string): Promise<SocialAccount[]> {
    try {
      const q = query(collection(db, COLLECTIONS.ACCOUNTS), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialAccount));
    } catch (err) {
      console.error('[vibeService.getAccounts]', err);
      return [];
    }
  },

  async saveAccount(userId: string, account: Omit<SocialAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<SocialAccount> {
    const now = new Date().toISOString();
    const docId = account.id || `${account.platform}_${Date.now()}`;
    const fullAccount: SocialAccount = {
      ...account,
      id: docId,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, COLLECTIONS.ACCOUNTS, docId), fullAccount, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.ACCOUNTS}/${docId}`);
    }
    return fullAccount;
  },

  async deleteAccount(userId: string, accountId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.ACCOUNTS, accountId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.ACCOUNTS}/${accountId}`);
    }
  },

  // --- CONVERSATIONS ---
  async getConversations(userId: string, filter?: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.CONVERSATIONS), 
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));

      if (filter) {
        if (filter === 'Unread') list = list.filter(c => c.unread);
        else if (filter === 'Needs Reply') list = list.filter(c => c.status === 'NEW' || c.status === 'AI_DRAFT');
        else if (filter === 'AI Drafts') list = list.filter(c => c.status === 'AI_DRAFT' || c.status === 'WAITING_APPROVAL');
        else if (filter === 'Approved') list = list.filter(c => c.status === 'APPROVED');
        else if (filter === 'Escalated') list = list.filter(c => c.status === 'ESCALATED');
        else if (filter === 'Resolved') list = list.filter(c => c.status === 'RESOLVED' || c.status === 'SENT');
      }

      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      console.error('[vibeService.getConversations]', err);
      return [];
    }
  },

  async saveConversation(userId: string, conversation: Partial<Conversation> & { id: string }): Promise<Conversation> {
    const now = new Date().toISOString();
    const docRef = doc(db, COLLECTIONS.CONVERSATIONS, conversation.id);

    const updateData = {
      ...conversation,
      userId,
      updatedAt: now,
    };

    try {
      await setDoc(docRef, updateData, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.CONVERSATIONS}/${conversation.id}`);
    }

    const updated = await getDoc(docRef);
    return { id: conversation.id, ...updated.data() } as Conversation;
  },

  async updateConversationStatus(conversationId: string, status: Conversation['status'], extra?: Partial<Conversation>): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.CONVERSATIONS, conversationId), {
        status,
        updatedAt: new Date().toISOString(),
        ...extra,
      });
    } catch (err) {
      console.error('[vibeService.updateConversationStatus]', err);
    }
  },

  // --- MESSAGES ---
  async getMessages(conversationId: string): Promise<ConversationMessage[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGES),
        where('conversationId', '==', conversationId)
      );
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConversationMessage));
      return msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (err) {
      console.error('[vibeService.getMessages]', err);
      return [];
    }
  },

  async addMessage(msg: Omit<ConversationMessage, 'id'>): Promise<ConversationMessage> {
    const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), msg);
    return { id: docRef.id, ...msg };
  },

  // --- AUTOMATION RULES ---
  async getRules(userId: string): Promise<AutomationRule[]> {
    try {
      const q = query(collection(db, COLLECTIONS.RULES), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AutomationRule));
    } catch (err) {
      console.error('[vibeService.getRules]', err);
      return [];
    }
  },

  async saveRule(userId: string, rule: Omit<AutomationRule, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<AutomationRule> {
    const now = new Date().toISOString();
    const ruleId = rule.id || `rule_${Date.now()}`;
    const fullRule: AutomationRule = {
      ...rule,
      id: ruleId,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, COLLECTIONS.RULES, ruleId), fullRule, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.RULES}/${ruleId}`);
    }
    return fullRule;
  },

  async deleteRule(userId: string, ruleId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.RULES, ruleId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.RULES}/${ruleId}`);
    }
  },

  // --- BRAND PROFILE ---
  async getBrandProfile(userId: string): Promise<BrandProfile | null> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.BRAND_PROFILES, userId));
      if (docSnap.exists()) {
        return docSnap.data() as BrandProfile;
      }
    } catch (err) {
      console.error('[vibeService.getBrandProfile]', err);
    }
    return null;
  },

  async saveBrandProfile(userId: string, profile: Partial<BrandProfile>): Promise<BrandProfile> {
    const fullProfile: BrandProfile = {
      userId,
      brandName: profile.brandName || 'Nisar AI Studio',
      style: profile.style || 'Friendly',
      customDescription: profile.customDescription || '',
      primaryLanguage: profile.primaryLanguage || 'English',
      allowedLanguages: profile.allowedLanguages || ['English', 'Urdu', 'Roman Urdu', 'Hindi', 'Arabic'],
      responseLength: profile.responseLength || 'medium',
      emojiUsage: profile.emojiUsage || 'minimal',
      formality: profile.formality || 'balanced',
      callToActionStyle: profile.callToActionStyle || 'Soft invitation to learn more',
      forbiddenWords: profile.forbiddenWords || [],
      requiredPhrases: profile.requiredPhrases || [],
      businessInfo: profile.businessInfo || 'Nisar AI Studio Super AI Toolbox - Multi-agent AI SaaS Platform.',
      moderationRules: profile.moderationRules || ['No aggressive language', 'No price commitments without confirmation'],
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, COLLECTIONS.BRAND_PROFILES, userId), fullProfile, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.BRAND_PROFILES}/${userId}`);
    }
    return fullProfile;
  },

  // --- SETTINGS ---
  async getSettings(userId: string): Promise<VibeSettings> {
    const defaultSettings: VibeSettings = {
      userId,
      automationStatus: 'ONLINE',
      mode: 'HYBRID',
      confidenceThreshold: 0.85,
      autoEscalateNegative: true,
      notifyOnEscalation: true,
      notifyOnFailure: true,
      maxRepliesPerDay: 500,
      updatedAt: new Date().toISOString(),
    };

    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, userId));
      if (docSnap.exists()) {
        return { ...defaultSettings, ...docSnap.data() };
      }
    } catch (err) {
      console.error('[vibeService.getSettings]', err);
    }
    return defaultSettings;
  },

  async saveSettings(userId: string, settings: Partial<VibeSettings>): Promise<VibeSettings> {
    const updated = {
      userId,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, userId), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.SETTINGS}/${userId}`);
    }
    return updated as VibeSettings;
  },

  // --- AUDIT LOGS ---
  async logAudit(userId: string, entry: Omit<AuditLogEntry, 'id' | 'userId' | 'timestamp'>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      ...entry,
      timestamp: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, COLLECTIONS.AUDIT_LOGS), fullEntry);
    } catch (err) {
      console.error('[vibeService.logAudit]', err);
    }
  },

  async getAuditLogs(userId: string, limitCount: number = 20): Promise<AuditLogEntry[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.AUDIT_LOGS),
        where('userId', '==', userId),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLogEntry));
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      console.error('[vibeService.getAuditLogs]', err);
      return [];
    }
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<VibeNotification[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VibeNotification));
      return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('[vibeService.getNotifications]', err);
      return [];
    }
  },

  async createNotification(userId: string, note: Omit<VibeNotification, 'id' | 'userId' | 'read' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...note,
        userId,
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[vibeService.createNotification]', err);
    }
  }
};
