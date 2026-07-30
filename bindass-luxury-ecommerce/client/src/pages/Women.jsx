import React from 'react';
import AdHero from '../components/AdHero';
import AdStrip from '../components/AdStrip';
import AdMiddle from '../components/AdMiddle';
import AdBreak from '../components/AdBreak';
import UnifiedProductGrid from '../components/UnifiedProductGrid';

const Women = () => {
    return (
        <div className="min-h-screen bg-white">
            <AdHero page="women" />
            <AdStrip page="women" />
            <AdMiddle page="women" />
            
            <UnifiedProductGrid title="Women's Collection" pageTarget="womens_collection" />

            <AdBreak page="women" fallbackTitle="WOMENSWEAR EDITORIAL" />
        </div>
    );
};

export default Women;
