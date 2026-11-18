import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export const APP_SETTINGS_COLLECTION = 'app_settings';
export const TOOLS_CONFIG_DOC_ID = 'tools_config';
export const TOOLS_CONFIG_PATH = `${APP_SETTINGS_COLLECTION}/${TOOLS_CONFIG_DOC_ID}`;
export const STUDIO_ADMIN_EMAIL = 'nisarrsna@gmail.com';

export interface ToolConfigDoc {
  disabledTools: string[];
  updatedBy?: string;
  updatedAt?: unknown;
}

export function isStudioAdmin(user?: { email?: string | null; emailVerified?: boolean | null } | null): boolean {
  if (!user) return false;
  return Boolean(user.emailVerified && user.email?.toLowerCase() === STUDIO_ADMIN_EMAIL);
}

export function getToolsConfigRef() {
  return doc(db, APP_SETTINGS_COLLECTION, TOOLS_CONFIG_DOC_ID);
}

export async function saveDisabledTools(
  disabledTools: string[],
  adminEmail: string
): Promise<string[]> {
  const cleanList = Array.from(
    new Set(
      disabledTools
        .filter((id) => typeof id === 'string' && id.trim().length > 0)
        .map((id) => id.trim().slice(0, 60))
    )
  ).slice(0, 50);

  try {
    await setDoc(
      getToolsConfigRef(),
      {
        disabledTools: cleanList,
        updatedBy: adminEmail.slice(0, 128),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return cleanList;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, TOOLS_CONFIG_PATH);
  }
}
