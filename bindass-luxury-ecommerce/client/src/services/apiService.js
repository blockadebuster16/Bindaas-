/**
 * Centralized API Service
 *
 * - Single Axios instance pointing to API_BASE_URL
 * - Request interceptor: auto-attaches Customer JWT from localStorage to every request
 * - Response interceptor: unified error handling with structured logs
 *
 * Usage:
 *   import api from "../services/apiService";
 *   const { data } = await api.get("/api/products");
 *   const { data } = await api.post("/api/cart/sync", payload); // token attached automatically
 */
import axios from "axios";

const TOKEN_KEY = "bindass_user_token";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request Interceptor: Attach Customer JWT ──────────────────────────────────
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (err) {
            if (process.env.NODE_ENV === "development") {
                console.warn("[apiService] Could not read token from localStorage:", err.message);
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

        if (process.env.NODE_ENV === "development") {
            console.error(`[apiService] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${status}: ${message}`);
        }

        // If 401 from a protected route, clear stale token
        if (status === 401) {
            localStorage.removeItem(TOKEN_KEY);
        }

        const enhancedError = new Error(message);
        enhancedError.status = status;
        enhancedError.originalError = error;
        return Promise.reject(enhancedError);
    }
);

export default api;
