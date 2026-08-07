import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Show only if user hasn't made a choice yet
        const cookieChoice = localStorage.getItem('cookieConsent');
        if (!cookieChoice) {
            // Small delay so it doesn't flash on first render
            const t = setTimeout(() => setIsVisible(true), 1200);
            return () => clearTimeout(t);
        }
    }, []);

    const handleAcceptAll = () => {
        setIsVisible(false);
        localStorage.setItem('cookieConsent', 'all');
    };

    // GDPR/PDPB compliant: allow declining optional cookies
    const handleRequiredOnly = () => {
        setIsVisible(false);
        localStorage.setItem('cookieConsent', 'required');
        window['ga-disable-GA_MEASUREMENT_ID'] = true;
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto z-[170] font-display pointer-events-none sm:max-w-[420px]"
            role="dialog"
            aria-modal="true"
            aria-label="Cookie consent"
            aria-live="polite"
        >
            <div className="bg-white w-full px-5 py-5 sm:px-7 sm:py-8 shadow-2xl border-t sm:border border-gray-100 pointer-events-auto sm:rounded-xl">

                <h2 className="text-center text-[13px] tracking-wider text-black font-bold mb-4 uppercase">
                    Before You Start Shopping
                </h2>

                <div className="text-[12px] leading-relaxed text-gray-700 mb-3">
                    <p>
                        We use first- and third-party cookies to personalise content, run analytics, and deliver relevant advertising.
                    </p>
                </div>

                {/* Expandable details */}
                <button
                    type="button"
                    onClick={() => setShowDetails(v => !v)}
                    className="text-[11px] font-semibold text-black border-b border-dashed border-gray-400 pb-px hover:text-gray-600 transition-colors bg-transparent mb-4 block"
                >
                    {showDetails ? 'Hide details ↑' : 'Cookie and data sharing notice ↓'}
                </button>

                {showDetails && (
                    <div className="text-[11px] text-gray-600 leading-relaxed mb-4 bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-2">
                        <p><strong>Required cookies:</strong> Session management, cart, authentication — always active.</p>
                        <p><strong>Analytics cookies:</strong> Microsoft Clarity, usage metrics — optional.</p>
                        <p><strong>Marketing cookies:</strong> Personalised ads — optional, requires your consent.</p>
                    </div>
                )}

                {/* Buttons — side by side on mobile to save vertical space */}
                <div className="flex gap-2 sm:flex-col sm:gap-2.5">
                    <button
                        onClick={handleAcceptAll}
                        className="flex-1 sm:w-full bg-[#111111] text-white py-3 text-[11px] font-bold tracking-widest hover:bg-[#FFD017] hover:text-[#111111] transition-colors rounded-lg uppercase"
                    >
                        Accept All
                    </button>

                    <button
                        onClick={handleRequiredOnly}
                        className="flex-1 sm:w-full bg-white text-black py-3 text-[11px] font-bold tracking-widest border border-black hover:bg-gray-50 transition-colors rounded-lg uppercase"
                    >
                        Required Only
                    </button>
                </div>

                <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed hidden sm:block">
                    By clicking "Accept All" you agree to the use of cookies as described in our{' '}
                    <a href="/privacy" className="underline hover:text-black transition-colors">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
};

export default CookieBanner;
