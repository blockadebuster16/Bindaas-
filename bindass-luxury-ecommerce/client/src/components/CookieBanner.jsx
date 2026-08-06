import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Show only if user hasn't made a choice yet
        const cookieChoice = localStorage.getItem('cookieConsent');
        if (!cookieChoice) {
            setIsVisible(true);
        }
    }, []);

    const handleAcceptAll = () => {
        setIsVisible(false);
        localStorage.setItem('cookieConsent', 'all');
        // Here you would enable analytics, marketing cookies etc.
    };

    // GDPR/PDPB compliant: allow declining optional cookies
    const handleRequiredOnly = () => {
        setIsVisible(false);
        localStorage.setItem('cookieConsent', 'required');
        // Disable analytics/marketing scripts here
        window['ga-disable-GA_MEASUREMENT_ID'] = true; // Opt out of GA if used
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col font-display pointer-events-none max-w-[420px]">
            <div className="bg-white w-full px-7 py-8 shadow-2xl relative border border-gray-100 pointer-events-auto rounded-xl">

                <h2 className="text-center text-[13px] tracking-wider text-black font-bold mb-5 uppercase">
                    Before You Start Shopping
                </h2>

                <div className="text-[12px] leading-relaxed text-gray-700 mb-4">
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

                <div className="space-y-2.5">
                    <button
                        onClick={handleAcceptAll}
                        className="w-full bg-[#111111] text-white py-3.5 text-[11px] font-bold tracking-widest hover:bg-gray-800 transition-colors rounded-lg uppercase"
                    >
                        Accept All
                    </button>

                    <button
                        onClick={handleRequiredOnly}
                        className="w-full bg-white text-black py-3.5 text-[11px] font-bold tracking-widest border border-black hover:bg-gray-50 transition-colors rounded-lg uppercase"
                    >
                        Required Cookies Only
                    </button>
                </div>

                <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                    By clicking "Accept All" you agree to the use of cookies as described in our{' '}
                    <a href="/privacy" className="underline hover:text-black transition-colors">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
};

export default CookieBanner;
