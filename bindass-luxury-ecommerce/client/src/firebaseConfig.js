import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAL-dBpVNF8ETL3Bg7QykpgNQqzjqCYucU",
    authDomain: "startup-website-2546.firebaseapp.com",
    projectId: "startup-website-2546",
    storageBucket: "startup-website-2546.firebasestorage.app",
    messagingSenderId: "176837902104",
    appId: "1:176837902104:web:43e9473460db602126a86d",
    measurementId: "G-WWTK986VXB"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


