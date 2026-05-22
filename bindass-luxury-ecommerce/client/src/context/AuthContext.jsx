import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig'; // You'll need to create a basic firebaseConfig file
import { 
    GoogleAuthProvider, 
    FacebookAuthProvider,
    signInWithPopup, 
    signOut, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile 
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const facebookSignIn = () => {
        const provider = new FacebookAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const signInWithEmail = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signUpWithEmail = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const updateUserProfile = (user, profileData) => {
        return updateProfile(user, profileData);
    };

    const logOut = () => signOut(auth);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            googleSignIn, 
            facebookSignIn,
            logOut, 
            signInWithEmail,
            signUpWithEmail, 
            updateUserProfile,
            isAuthModalOpen,
            setIsAuthModalOpen
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);