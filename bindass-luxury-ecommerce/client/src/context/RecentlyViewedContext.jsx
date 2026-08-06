import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const RecentlyViewedContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const BASE_URL = `${API_BASE}/api/users/recently-viewed`;

export const RecentlyViewedProvider = ({ children }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState(() => {
        const stored = localStorage.getItem('bindass_recently_viewed');
        return stored ? JSON.parse(stored) : [];
    });

    // 1. Local Persistence (for guest and backup)
    useEffect(() => {
        localStorage.setItem('bindass_recently_viewed', JSON.stringify(history));
    }, [history]);

    // 2. Sync Logic (Login / Initial Fetch)
    useEffect(() => {
        const syncHistory = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem("bindass_user_token");
                    const productIds = history.map(item => item._id || item);

                    // Bulk sync local history to server
                    const { data: updatedHistory } = await axios.post(`${BASE_URL}/sync`,
                        { productIds },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    setHistory(updatedHistory);
                } catch (err) {
                    console.error("Error syncing history on login:", err);
                }
            }
        };

        syncHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // 3. Add to History
    const addToHistory = async (product) => {
        const productId = product._id || product;

        // Update Local State immediately for responsiveness
        setHistory(prev => {
            // Remove existing to pull to front
            const filtered = prev.filter(item => (item._id || item) !== productId);
            return [product, ...filtered].slice(0, 12);
        });

        // If logged in, inform the server
        if (user) {
            try {
                const token = localStorage.getItem("bindass_user_token");
                await axios.post(BASE_URL,
                    { productId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Failed to sync view event to server:", err);
            }
        }
    };

    return (
        <RecentlyViewedContext.Provider value={{
            history,
            addToHistory
        }}>
            {children}
        </RecentlyViewedContext.Provider>
    );
};

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);


