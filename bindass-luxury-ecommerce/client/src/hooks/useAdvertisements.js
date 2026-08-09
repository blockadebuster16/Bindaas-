import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const fetchAdvertisements = async ({ queryKey }) => {
    const [_key, page] = queryKey;
    const url = page 
        ? `${API_BASE_URL}/api/advertisements?page=${page}` 
        : `${API_BASE_URL}/api/advertisements`;
    
    const { data } = await axios.get(url);
    // Group ads by bannerType
    const adsArray = Array.isArray(data) ? data : [];
    const groupedAds = adsArray.reduce((acc, ad) => {
        acc[ad.bannerType] = acc[ad.bannerType] || [];
        acc[ad.bannerType].push(ad);
        return acc;
    }, {});

    return groupedAds;
};

export const useAdvertisements = (page = 'home') => {
    return useQuery({
        queryKey: ['advertisements', page],
        queryFn: fetchAdvertisements,
        staleTime: 10 * 60 * 1000, // Ads rarely change
    });
};
