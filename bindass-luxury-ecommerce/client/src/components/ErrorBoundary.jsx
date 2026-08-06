import React from 'react';

/**
 * ErrorBoundary — React class component that catches runtime errors
 * in the component tree and renders a fallback UI instead of crashing
 * the entire app to a blank screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 * Or with a custom fallback:
 *   <ErrorBoundary fallback={<MyCustomErrorPage />}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log to structured logger / Sentry if available
        if (process.env.NODE_ENV === 'development') {
            console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        }
        // TODO: send to Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center px-6 font-sans">
                    <div className="text-center max-w-md">
                        {/* Brand icon */}
                        <div className="w-16 h-16 bg-[#111111] rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-[#FFD017]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-[#111111] mb-2 tracking-tight">
                            Something went wrong
                        </h1>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            We hit an unexpected snag. This has been noted and our team is on it.
                            Try refreshing — it usually does the trick.
                        </p>

                        {/* Stack trace in dev mode */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-xs text-red-700 font-mono overflow-auto max-h-40">
                                <summary className="cursor-pointer font-bold mb-2">
                                    Error Details (dev only)
                                </summary>
                                <pre className="whitespace-pre-wrap break-all">
                                    {this.state.error.toString()}
                                    {'\n\n'}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="bg-[#111111] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-xl hover:bg-[#2a2a2a] transition-colors"
                            >
                                Refresh Page
                            </button>
                            <a
                                href="/"
                                className="bg-white border border-[#111111] text-[#111111] text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Go Home
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
