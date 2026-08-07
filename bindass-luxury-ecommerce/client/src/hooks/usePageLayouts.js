import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const fetchPageLayout = async ({ queryKey }) => {
    const [_key, pageName] = queryKey;
    const { data } = await axios.get(`${API_BASE_URL}/api/page-layouts/${pageName}`);
    return data;
};

export const usePageLayout = (pageName) => {
    return useQuery({
        queryKey: ['pageLayout', pageName],
        queryFn: fetchPageLayout,
        staleTime: 10 * 60 * 1000, // Layouts rarely change
        enabled: !!pageName, // Only fetch if pageName is provided
    });
};
