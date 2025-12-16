import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// INITIALIZE FIREBASE
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
};

//Validate Firebase configuration

function validateFirebaseConfig() {
    const required = ['projectId', 'privateKey', 'clientEmail', 'databaseURL'];
    const missing = required.filter(key => !firebaseConfig[key]);

    if (missing.length > 0) {
        throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
    }

    console.log('Firebase configuration validated');
}


// Initialize Firebase Admin SDK

function initializeFirebase() {
    try {
        validateFirebaseConfig();

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(firebaseConfig),
                databaseURL: firebaseConfig.databaseURL,
            });

            console.log('Firebase Admin SDK initialized');
        }

        return admin.database();
    } catch (error) {
        console.error('Firebase initialization failed:', error.message);
        throw error;
    }
}

// Initialize on import
const db = initializeFirebase();

export { db, admin, firebaseConfig };
