import admin from 'firebase-admin';

const initializeFirebase = () => {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
  }
};

export default initializeFirebase;
export { admin };
