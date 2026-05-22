import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted or dismissed cookies globally
        const hasAccepted = localStorage.getItem('cookiesAccepted');
        
        // Show immediately upon load if no record is found
        if (!hasAccepted) {
            setIsVisible(true);
        }
    }, []);

    const handleAcceptAll = () => {
        setIsVisible(false);
        localStorage.setItem('cookiesAccepted', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col font-display pointer-events-none">
            <div className="bg-white w-full max-w-[400px] px-8 py-10 shadow-2xl relative border border-gray-100 animate-fade-in-up pointer-events-auto">
                
                <h2 className="text-center text-[13px] tracking-wider text-black font-medium mb-8">
                    BEFORE YOU START SHOPPING
                </h2>

                <div className="text-[13px] leading-relaxed text-gray-800 space-y-4 mb-6">
                    <p>
                        We use first- and third-party cookies including other tracking technologies from third party publishers to give you the full functionality of our website, customize your user experience, perform analytics and deliver personalized advertising on our websites, apps and newsletters across internet and via social media platforms. For that purpose, we collect information about user, browsing patterns and device.
                    </p>
                    <p>
                        By clicking "Accept all", you accept and agree that we share this information with third parties, such as our advertising partners. By choosing "Only required cookies", optional cookies are blocked, limiting our delivery of tailored content and features. Click on "Cookies and services settings" to customize your options. Visit our Cookie and data sharing notice to learn more.
                    </p>
                </div>

                <div className="text-center mb-8">
                    <a href="#" className="text-[13px] font-medium text-black border-b border-black pb-[1px] hover:text-gray-500 hover:border-gray-500 transition-colors">
                        Cookie and data sharing notice
                    </a>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={handleAcceptAll}
                        className="w-full bg-black text-white py-4 text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        ACCEPT ALL
                    </button>
                    
                    <button 
                        onClick={() => { /* Open settings modal in future */ }}
                        className="w-full bg-white text-black py-4 text-xs font-medium tracking-widest border border-black hover:bg-gray-50 transition-colors"
                    >
                        COOKIES AND SERVICES SETTINGS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
