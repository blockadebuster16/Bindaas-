import React from 'react';
import AdHero from '../components/AdHero';
import AdStrip from '../components/AdStrip';
import AdMiddle from '../components/AdMiddle';
import UnifiedProductGrid from '../components/UnifiedProductGrid';
import { useAdvertisements } from '../hooks/useAdvertisements';

const SportCollection = () => {
    const { data: adsByBannerType = {} } = useAdvertisements('sportscollection');

    return (
        <div className="min-h-screen bg-white">
            <AdHero heroAdsData={adsByBannerType['hero'] || []} />
            <AdStrip stripAdsData={adsByBannerType['strip'] || []} />
            <AdMiddle adData={(adsByBannerType['middle'] || [])[0] || null} />
            
            <UnifiedProductGrid title="Sport Collection" pageTarget="sportscollection" />
        </div>
    );
};

export default SportCollection;
