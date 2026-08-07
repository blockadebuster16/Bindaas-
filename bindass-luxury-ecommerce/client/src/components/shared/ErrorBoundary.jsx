import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-6 font-sans">
            <div className="max-w-md w-full bg-white p-8 md:p-12 text-center border-t-4 border-[#111111] shadow-2xl">
                <span className="material-icons-outlined text-5xl text-red-500 mb-6 block">error_outline</span>
                <h1 className="text-2xl font-extrabold uppercase tracking-tight mb-4 text-[#111111]">
                    Oops, something went wrong
                </h1>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    We're sorry, but an unexpected error occurred. Our team has been notified.
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-8 text-left bg-gray-50 p-4 overflow-auto max-h-48 border border-gray-200">
                        <p className="text-xs text-red-600 font-mono font-bold mb-2">{error.message}</p>
                        <pre className="text-[10px] text-gray-600 font-mono whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                )}
                
                <button
                    onClick={() => {
                        resetErrorBoundary();
                        window.location.href = '/';
                    }}
                    className="w-full bg-[#111111] text-white py-4 font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#FFD017] hover:text-[#111111] transition-colors"
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export const ErrorBoundary = ({ children }) => {
    return (
        <ReactErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
        </ReactErrorBoundary>
    );
};
