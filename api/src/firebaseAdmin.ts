import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from './config.js';

if (getApps().length === 0) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  initializeApp({
    credential: serviceAccountJson
      ? cert(JSON.parse(serviceAccountJson))
      : applicationDefault(),
    projectId: config.firebase.projectId,
  });
}

export const firebaseAuth = getAuth();
