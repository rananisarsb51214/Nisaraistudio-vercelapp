import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp, orderBy } from 'firebase/firestore';

const PROJECTS_COLLECTION = 'projects';
const JOBS_COLLECTION = 'jobs';
const PRODUCTS_COLLECTION = 'products';

export const projectService = {
  // --- PROJECTS ---
  getProjectsQuery: (tenantId: string) => {
    return query(
      collection(db, PROJECTS_COLLECTION), 
      where('tenantId', '==', tenantId)
    );
  },
  
  createProject: async (name: string, tenantId: string) => {
    try {
      return await addDoc(collection(db, PROJECTS_COLLECTION), {
        name,
        tenantId,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, PROJECTS_COLLECTION);
    }
  },

  deleteProject: async (projectId: string) => {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    try {
      return await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${PROJECTS_COLLECTION}/${projectId}`);
    }
  },

  // --- JOBS (AI BLOG GENERATION PIPELINE) ---
  getJobsQuery: (projectId: string) => {
    return query(
      collection(db, JOBS_COLLECTION),
      where('projectId', '==', projectId)
    );
  },

  createJob: async (topic: string, projectId: string, tenantId: string, status = 'Queued') => {
    try {
      return await addDoc(collection(db, JOBS_COLLECTION), {
        topic,
        projectId,
        tenantId,
        status,
        createdAt: Timestamp.now(),
        title: '',
        metaDescription: '',
        keywords: [],
        content: '',
        readTime: '',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, JOBS_COLLECTION);
    }
  },

  updateJob: async (jobId: string, data: any) => {
    const docRef = doc(db, JOBS_COLLECTION, jobId);
    try {
      return await updateDoc(docRef, data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${JOBS_COLLECTION}/${jobId}`);
    }
  },

  deleteJob: async (jobId: string) => {
    const docRef = doc(db, JOBS_COLLECTION, jobId);
    try {
      return await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${JOBS_COLLECTION}/${jobId}`);
    }
  },

  // --- PRODUCTS (ECOM MONEY MACHINE AFFILIATE FUNNELS) ---
  getProductsQuery: (projectId: string) => {
    return query(
      collection(db, PRODUCTS_COLLECTION),
      where('projectId', '==', projectId)
    );
  },

  createProduct: async (
    url: string,
    brand: string,
    country: string,
    projectId: string,
    tenantId: string,
    generatedData: any
  ) => {
    try {
      return await addDoc(collection(db, PRODUCTS_COLLECTION), {
        url,
        brand,
        country,
        projectId,
        tenantId,
        generatedData,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, PRODUCTS_COLLECTION);
    }
  },

  deleteProduct: async (productId: string) => {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    try {
      return await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
    }
  },

  // --- AGENTS (AGENT BUILDER ENGINE) ---
  getAgentsQuery: (projectId: string) => {
    return query(
      collection(db, 'agents'),
      where('projectId', '==', projectId)
    );
  },

  createAgent: async (
    name: string,
    persona: string,
    instructions: string,
    temperature: number,
    model: string,
    projectId: string,
    tenantId: string
  ) => {
    try {
      return await addDoc(collection(db, 'agents'), {
        name,
        persona,
        instructions,
        temperature,
        model,
        projectId,
        tenantId,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'agents');
    }
  },

  deleteAgent: async (agentId: string) => {
    const docRef = doc(db, 'agents', agentId);
    try {
      return await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `agents/${agentId}`);
    }
  },

  // --- PAGES (WEBSITE BUILDER PERSISTENCE) ---
  getPagesQuery: (projectId: string) => {
    return query(
      collection(db, 'pages'),
      where('projectId', '==', projectId)
    );
  },

  createPage: async (name: string, blocks: any[], projectId: string, tenantId: string) => {
    try {
      return await addDoc(collection(db, 'pages'), {
        name,
        blocks,
        projectId,
        tenantId,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'pages');
    }
  },

  updatePage: async (pageId: string, name: string, blocks: any[]) => {
    const docRef = doc(db, 'pages', pageId);
    try {
      return await updateDoc(docRef, {
        name,
        blocks,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `pages/${pageId}`);
    }
  },

  deletePage: async (pageId: string) => {
    const docRef = doc(db, 'pages', pageId);
    try {
      return await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `pages/${pageId}`);
    }
  },

  // --- ACTIVITIES (RECENT ACTIVITY LOG) ---
  getActivitiesQuery: (tenantId: string) => {
    return query(
      collection(db, 'activities'),
      where('tenantId', '==', tenantId)
    );
  },

  getProjectActivitiesQuery: (projectId: string) => {
    return query(
      collection(db, 'activities'),
      where('projectId', '==', projectId)
    );
  },

  logActivity: async (description: string, type: string, projectId: string, tenantId: string) => {
    try {
      return await addDoc(collection(db, 'activities'), {
        description,
        type,
        projectId,
        tenantId,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  }
};
