import React from 'react';
import AdHero from '../components/AdHero';
import AdStrip from '../components/AdStrip';
import AdMiddle from '../components/AdMiddle';
import UnifiedProductGrid from '../components/UnifiedProductGrid';

const SportCollection = () => {
    return (
        <div className="min-h-screen bg-white">
            <AdHero page="sportscollection" />
            <AdStrip page="sportscollection" />
            <AdMiddle page="sportscollection" />
            
            <UnifiedProductGrid title="Sport Collection" pageTarget="sportscollection" />
        </div>
    );
};

export default SportCollection;
