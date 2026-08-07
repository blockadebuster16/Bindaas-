import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

const AuthContext = createContext();

const TOKEN_KEY = "bindass_user_token";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";

// ── Decode a JWT payload without a library (no signature verification needed client-side) ──
function decodeToken(token) {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
        return null;
    }
}

function isTokenExpired(decoded) {
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authError, setAuthError] = useState(null);

    // ── Restore session from localStorage on mount ─────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            const decoded = decodeToken(token);
            if (decoded && !isTokenExpired(decoded)) {
                setUser(decoded);
            } else {
                localStorage.removeItem(TOKEN_KEY);
            }
        }
        setLoading(false);
    }, []);

    // ── Store token and update user state ─────────────────────────────────────
    const setSession = useCallback((token) => {
        if (!token) {
            localStorage.removeItem(TOKEN_KEY);
            setUser(null);
            return;
        }
        const decoded = decodeToken(token);
        if (decoded && !isTokenExpired(decoded)) {
            localStorage.setItem(TOKEN_KEY, token);
            setUser(decoded);
        }
    }, []);

    // ── Google Sign-In: redirect browser to server OAuth route ────────────────
    const googleSignIn = useCallback(() => {
        setAuthError(null);
        window.location.href = `${API_BASE}/api/auth/google`;
    }, []);

    // ── Email/Password: Register ───────────────────────────────────────────────
    const signUpWithEmail = useCallback(async ({ email, password, firstName, lastName, mobile, birthdate, gender }) => {
        setAuthError(null);
        const { data } = await axios.post(`${API_BASE}/api/auth/register`, {
            email, password, firstName, lastName, mobile, birthdate, gender,
        });
        if (data.success && data.token) {
            setSession(data.token);
        }
        return data;
    }, [setSession]);

    // ── Email/Password: Login ──────────────────────────────────────────────────
    const signInWithEmail = useCallback(async (email, password) => {
        setAuthError(null);
        const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
        if (data.success && data.token) {
            setSession(data.token);
        }
        return data;
    }, [setSession]);

    // ── Log out ────────────────────────────────────────────────────────────────
    const logOut = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setIsAuthModalOpen(false);
    }, []);

    // ── (Unused — kept for API compatibility with SignInModal) ─────────────────
    const updateUserProfile = useCallback(async (profileData) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;
        await axios.put(`${API_BASE}/api/users/profile`, profileData, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }, []);

    const value = useMemo(() => ({
        user,
        setSession,       // used by AuthCallback page to store token after Google redirect
        googleSignIn,
        signInWithEmail,
        signUpWithEmail,
        updateUserProfile,
        logOut,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authError,
        setAuthError,
    }), [user, isAuthModalOpen, authError, setSession, googleSignIn, signInWithEmail, signUpWithEmail, updateUserProfile, logOut]);

    // Branded loading screen while restoring session
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[#111111] border-t-[#FFD017] rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#111111]/50">
                        BiNDAAS!
                    </span>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
