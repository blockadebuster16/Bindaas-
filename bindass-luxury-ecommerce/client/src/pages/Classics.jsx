import React from 'react';
import AdHero from '../components/AdHero';
import AdStrip from '../components/AdStrip';
import AdMiddle from '../components/AdMiddle';
import UnifiedProductGrid from '../components/UnifiedProductGrid';

const Classics = () => {
    return (
        <div className="min-h-screen bg-white">
            <AdHero page="classics" />
            <AdStrip page="classics" />
            <AdMiddle page="classics" />
            
            <UnifiedProductGrid title="Classics" pageTarget="classics" />
        </div>
    );
};

export default Classics;
