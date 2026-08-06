import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authError, setAuthError] = useState(null);

    // Catches the result when Google/Facebook redirects back to your app (mobile flow)
    useEffect(() => {
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) setUser(result.user);
            })
            .catch((error) => {
                if (error.code !== 'auth/null-user') {
                    setAuthError(error.message);
                }
            });
    }, []);

    const signInWithProvider = async (provider) => {
        setAuthError(null);
        // Always use redirect on mobile — popup is always blocked there
        if (isMobile()) {
            return signInWithRedirect(auth, provider);
        }
        try {
            return await signInWithPopup(auth, provider);
        } catch (error) {
            // Popup was blocked on desktop — fall back to redirect silently
            if ([
                'auth/popup-blocked',
                'auth/popup-closed-by-user',
                'auth/cancelled-popup-request'
            ].includes(error.code)) {
                return signInWithRedirect(auth, provider);
            }
            setAuthError(error.message);
            throw error;
        }
    };

    const googleSignIn = () => signInWithProvider(new GoogleAuthProvider());
    const facebookSignIn = () => signInWithProvider(new FacebookAuthProvider());

    const signInWithEmail = (email, password) => {
        setAuthError(null);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signUpWithEmail = (email, password) => {
        setAuthError(null);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const updateUserProfile = (user, profileData) => updateProfile(user, profileData);

    const logOut = () => signOut(auth);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Branded loading screen while Firebase resolves the auth state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    {/* Animated brand mark */}
                    <div className="w-10 h-10 border-2 border-[#111111] border-t-[#FFD017] rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#111111]/50">
                        BiNDAAS!
                    </span>
                </div>
            </div>
        );
    }

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
            setIsAuthModalOpen,
            authError,
            setAuthError,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
