import React from 'react';
import AdHero from '../components/AdHero';
import AdStrip from '../components/AdStrip';
import AdMiddle from '../components/AdMiddle';
import UnifiedProductGrid from '../components/UnifiedProductGrid';

const Apparel = () => {
    return (
        <div className="min-h-screen bg-white">
            <AdHero page="apparel" />
            <AdStrip page="apparel" />
            <AdMiddle page="apparel" />
            
            <UnifiedProductGrid title="Apparel" pageTarget="apparel" />
        </div>
    );
};

export default Apparel;
