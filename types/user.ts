export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
  preferences?: {
    defaultLanguage?: string;
    defaultTone?: string;
    defaultModel?: string;
  };
}
