import React from 'react';
import AdHero from '../components/AdHero';
import AdStrip from '../components/AdStrip';
import AdMiddle from '../components/AdMiddle';
import UnifiedProductGrid from '../components/UnifiedProductGrid';

const Men = () => {
    return (
        <div className="min-h-screen bg-white">
            <AdHero page="men" />
            <AdStrip page="men" />
            <AdMiddle page="men" />
            
            <UnifiedProductGrid title="Men's Collection" pageTarget="mens_collection" />
        </div>
    );
};

export default Men;
