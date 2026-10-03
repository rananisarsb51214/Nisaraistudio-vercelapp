import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0171270179",
  appId: "1:589906924826:web:7a924f950ffc709fb348a3",
  apiKey: "AIzaSyBnz41W9KLUGXNYg62bJsgruwWN_xZrL0M",
  authDomain: "gen-lang-client-0171270179.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-920d46dd-8266-45c8-8dda-11999ec5401c",
  storageBucket: "gen-lang-client-0171270179.firebasestorage.app",
  messagingSenderId: "589906924826",
  measurementId: ""
};

let app: any = null;
let dbInstance: any = null;
let authInstance: any = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  authInstance = getAuth(app);
} catch (e) {
  console.error("Firebase initialization error:", e);
}

export const db = dbInstance;
export const auth = authInstance;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
