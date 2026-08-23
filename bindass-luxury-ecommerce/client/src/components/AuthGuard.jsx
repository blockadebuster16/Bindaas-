import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ROUTE-001 FIX: Client-side auth guard for protected user routes.
 * Redirects unauthenticated users to home and shows the login modal.
 * Preserves the intended destination via `state.from` for post-login redirect.
 */
const AuthGuard = ({ children }) => {
    const { user, setIsAuthModalOpen } = useAuth();
    const location = useLocation();

    if (!user) {
        // Open the sign-in modal and redirect to home
        // Using a timeout so the redirect renders first
        setTimeout(() => setIsAuthModalOpen(true), 100);
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGuard;
