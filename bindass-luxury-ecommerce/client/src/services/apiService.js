/**
 * Centralized API Service (Architecture Suggestion A + B)
 *
 * - Single Axios instance pointing to API_BASE_URL
 * - Request interceptor: auto-attaches Firebase ID token to every request
 *   so components never need to call user.getIdToken() manually
 * - Response interceptor: unified error handling with structured logs
 *
 * Usage:
 *   import api from '../services/apiService';
 *   const { data } = await api.get('/api/products');
 *   const { data } = await api.post('/api/cart/sync', payload); // token attached automatically
 */
import axios from 'axios';
import { auth } from '../firebaseConfig';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request Interceptor: Attach Firebase ID token ────────────────────────────
api.interceptors.request.use(
    async (config) => {
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                // Firebase caches the token and auto-refreshes when near-expiry
                const token = await currentUser.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (err) {
            // Token fetch failed — proceed without auth header (public endpoints still work)
            if (process.env.NODE_ENV === 'development') {
                console.warn('[apiService] Could not get Firebase ID token:', err.message);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor: Unified error handling ──────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (process.env.NODE_ENV === 'development') {
            console.error(`[apiService] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${status}: ${message}`);
        }

        // Re-throw with a clean error shape for consumers
        const enhancedError = new Error(message);
        enhancedError.status = status;
        enhancedError.originalError = error;
        return Promise.reject(enhancedError);
    }
);

export default api;
