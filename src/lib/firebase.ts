'use client';

import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

const ensureClientRuntime = () => {
    if (typeof window === 'undefined') {
        throw new Error('Firebase client SDK can only run in the browser.');
    }
};

export const getFirebaseApp = (): FirebaseApp => {
    ensureClientRuntime();
    if (!cachedApp) {
        cachedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    return cachedApp;
};

export const getFirebaseAuth = (): Auth => {
    if (!cachedAuth) {
        cachedAuth = getAuth(getFirebaseApp());
    }
    return cachedAuth;
};

export const getFirebaseDb = (): Firestore => {
    if (!cachedDb) {
        cachedDb = getFirestore(getFirebaseApp());
    }
    return cachedDb;
};

export const app = typeof window !== 'undefined' ? getFirebaseApp() : null;
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : null;
export const db = typeof window !== 'undefined' ? getFirebaseDb() : null;

export default firebaseConfig;
