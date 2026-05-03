import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from './config.js';

// Firebase Admin auto-detects credentials from:
// 1. GOOGLE_APPLICATION_CREDENTIALS env var (path to service account JSON)
// 2. Default credentials in GCP environments (Cloud Run, App Engine, etc.)
if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
    projectId: config.firebase.projectId,
  });
}

export const firebaseAuth = getAuth();
