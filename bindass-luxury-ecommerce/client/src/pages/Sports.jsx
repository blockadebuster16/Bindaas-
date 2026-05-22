import React from 'react';
import AdHero from '../components/AdHero';
import AdStrip from '../components/AdStrip';
import AdMiddle from '../components/AdMiddle';
import UnifiedProductGrid from '../components/UnifiedProductGrid';

const Sports = () => {
    return (
        <div className="min-h-screen bg-white">
            <AdHero page="sports" />
            <AdStrip page="sports" />
            <AdMiddle page="sports" />
            
            <UnifiedProductGrid title="Sports" pageTarget="sports" />
        </div>
    );
};

export default Sports;
