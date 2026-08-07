import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * AuthCallback
 * Handles the redirect from the server after Google OAuth completes.
 * URL format: /auth/callback?token=<jwt>  OR  /auth/callback?error=<reason>
 */
const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setSession } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (token) {
            setSession(token);
            navigate("/", { replace: true });
        } else {
            console.error("Google OAuth failed:", error);
            // Redirect home with a query param so the auth modal can show an error
            navigate("/?authError=" + (error || "unknown"), { replace: true });
        }
    }, [searchParams, setSession, navigate]);

    return (
        <div className="min-h-screen bg-bindas-parchment flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-bindas-onyx border-t-bindas-amber rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-bindas-onyx/50">
                    Signing you in...
                </span>
            </div>
        </div>
    );
};

export default AuthCallback;
