import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const fetchProducts = async ({ queryKey }) => {
    const [_key, params] = queryKey;
    const queryString = new URLSearchParams(params).toString();
    const url = queryString 
        ? `${API_BASE_URL}/api/products?${queryString}` 
        : `${API_BASE_URL}/api/products`;
    
    const { data } = await axios.get(url);
    return data;
};

export const useProducts = (params = {}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: fetchProducts,
        staleTime: 5 * 60 * 1000, // Products rarely change entirely within 5 minutes
    });
};
