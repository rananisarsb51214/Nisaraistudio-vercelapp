import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import firebaseAppletConfig from '../firebase-applet-config.json';

function readEnv(nextKey: string, viteKey: string): string | undefined {
  const fromProcess = process.env[nextKey] || process.env[viteKey];
  if (fromProcess && fromProcess.trim().length > 0) return fromProcess.trim();
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
    const fromVite = metaEnv?.[viteKey] || metaEnv?.[nextKey];
    if (fromVite && fromVite.trim().length > 0) return fromVite.trim();
  } catch {
    // import.meta.env unavailable in Node runtime
  }
  return undefined;
}

const DEFAULT_PROJECT_ID = 'gen-lang-client-0727141331';
const DEFAULT_WEB_APP_ID = '1:978292032659:web:8e98c2123fa055bd6cf966';
const DEFAULT_FPN = '978292032659';

const envProjectId = readEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID');
const hasAppletConfig = Boolean(firebaseAppletConfig?.projectId && firebaseAppletConfig?.apiKey);
const useEnvConfig =
  !hasAppletConfig ||
  (Boolean(envProjectId) && envProjectId === firebaseAppletConfig.projectId);

const firebaseConfig = {
  apiKey:
    (useEnvConfig && readEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY')) ||
    firebaseAppletConfig.apiKey,
  authDomain:
    (useEnvConfig && readEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN')) ||
    firebaseAppletConfig.authDomain,
  projectId: (useEnvConfig && envProjectId) || firebaseAppletConfig.projectId || DEFAULT_PROJECT_ID,
  storageBucket:
    (useEnvConfig &&
      readEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET')) ||
    firebaseAppletConfig.storageBucket,
  messagingSenderId:
    (useEnvConfig &&
      readEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID')) ||
    firebaseAppletConfig.messagingSenderId ||
    DEFAULT_FPN,
  appId:
    (useEnvConfig && readEnv('NEXT_PUBLIC_FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID')) ||
    firebaseAppletConfig.appId ||
    DEFAULT_WEB_APP_ID,
  measurementId:
    readEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', 'VITE_FIREBASE_MEASUREMENT_ID') ||
    firebaseAppletConfig.measurementId ||
    undefined,
};

const firestoreDatabaseId =
  (useEnvConfig && readEnv('NEXT_PUBLIC_FIREBASE_DATABASE_ID', 'VITE_FIREBASE_DATABASE_ID')) ||
  firebaseAppletConfig.firestoreDatabaseId;

export const FIREBASE_META = {
  projectId: firebaseConfig.projectId || DEFAULT_PROJECT_ID,
  webAppId: DEFAULT_WEB_APP_ID,
  configuredAppId: firebaseConfig.appId || DEFAULT_WEB_APP_ID,
  fpn: firebaseConfig.messagingSenderId || DEFAULT_FPN,
  firestoreDatabaseId: firestoreDatabaseId || '(default)',
  measurementId: firebaseConfig.measurementId || null,
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

try {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  dbInstance = firestoreDatabaseId
    ? getFirestore(appInstance, firestoreDatabaseId)
    : getFirestore(appInstance);
  authInstance = getAuth(appInstance);
} catch (e) {
  console.error('Firebase initialization error:', e);
}

export const app = appInstance;
export const db = dbInstance as Firestore;
export const auth = authInstance as Auth;

export const analytics: Promise<Analytics | null> | null =
  typeof window !== 'undefined' && appInstance && firebaseConfig.measurementId
    ? isSupported()
        .then((supported) => (supported && appInstance ? getAnalytics(appInstance) : null))
        .catch(() => null)
    : null;

async function testConnection() {
  if (typeof window === 'undefined' || !dbInstance) return;
  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (typeof window !== 'undefined') {
  void testConnection();
}

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
