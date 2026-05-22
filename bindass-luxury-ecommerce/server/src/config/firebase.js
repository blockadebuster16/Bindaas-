const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
// Initialize Firebase Admin
// Note: In production, use environment variables or a service account JSON file
// For development, you might rely on GOOGLE_APPLICATION_CREDENTIALS
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase Admin Initialized");
} catch (error) {
    console.error("Firebase Admin Initialization Error:", error.message);
    // Allow server to start even if Firebase fails, but auth middleware will fail
}

module.exports = admin;
