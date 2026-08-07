import React from 'react';
import { useLocation } from 'react-router-dom';

const PageLoader = () => {
    const location = useLocation();
    
    // Don't show heavy loader for admin routes if possible, or just keep it minimal
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bindas-parchment font-sans">
            <div className="relative flex flex-col items-center">
                {/* Minimalist Spinner */}
                <div className="w-12 h-12 border-2 border-slate-200 border-t-bindas-onyx rounded-full animate-spin"></div>
                
                {/* Branding Text */}
                <div className="mt-6 text-[10px] font-extrabold tracking-[0.3em] text-bindas-onyx uppercase animate-pulse">
                    Loading
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
