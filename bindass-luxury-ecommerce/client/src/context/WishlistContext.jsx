import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const BASE_URL = `${API_BASE}/api/wishlist`;

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const toast = useToast();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load & Login/Logout Sync
    useEffect(() => {
        let isMounted = true;
        const loadWishlist = async () => {
            setLoading(true);
            if (user) {
                try {
                    const token = localStorage.getItem("bindass_user_token");

                    // Get any local items they added as a guest before logging in
                    const local = localStorage.getItem('wishlist');
                    const guestWishlist = local ? JSON.parse(local) : [];
                    const productIds = guestWishlist.map(item => item._id || item);

                    // Sync current local wishlist IDs to server (Server handles merging)
                    const { data: persistentWishlist } = await axios.post(`${BASE_URL}/sync`,
                        { productIds },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (isMounted) setWishlistItems(persistentWishlist);

                    // Clear the local storage so it doesn't bleed back into guest mode upon logout
                    localStorage.removeItem('wishlist');
                } catch (err) {
                    console.error("Error merging wishlist on login:", err);
                }
            } else {
                // Not logged in: purely use guest local storage
                const local = localStorage.getItem('wishlist');
                if (isMounted) setWishlistItems(local ? JSON.parse(local) : []);
            }
            if (isMounted) setLoading(false);
        };

        loadWishlist();
        return () => { isMounted = false; };
    }, [user]);

    // Keep LocalStorage updated ONLY when user is not logged in (guest mode)
    useEffect(() => {
        if (!user && !loading) {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        }
    }, [wishlistItems, user, loading]);

    const syncWithServer = useCallback(async (items, previousItems) => {
        if (user) {
            try {
                const token = localStorage.getItem("bindass_user_token");
                const productIds = items.map(item => item._id || item);
                await axios.post(`${BASE_URL}/sync`,
                    { productIds },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Failed to sync wishlist to server:", err);
                // Rollback optimistic update
                setWishlistItems(previousItems);
                toast.error("Failed to update wishlist. Please try again.");
            }
        }
    }, [user, toast]);

    const addToWishlist = useCallback((product) => {
        if (wishlistItems.some(item => (item._id || item) === (product._id || product))) return;
        const previousItems = [...wishlistItems];
        const updated = [...wishlistItems, product];
        setWishlistItems(updated);
        syncWithServer(updated, previousItems);
    }, [wishlistItems, syncWithServer]);

    const removeFromWishlist = useCallback((productId) => {
        const previousItems = [...wishlistItems];
        const updated = wishlistItems.filter(item => (item._id || item) !== productId);
        setWishlistItems(updated);
        syncWithServer(updated, previousItems);
    }, [wishlistItems, syncWithServer]);

    const toggleWishlist = useCallback((product) => {
        const productId = product._id || product;
        const exists = wishlistItems.some(item => (item._id || item) === productId);
        const previousItems = [...wishlistItems];
        let updated;
        
        if (exists) {
            updated = wishlistItems.filter(item => (item._id || item) !== productId);
        } else {
            updated = [...wishlistItems, product];
        }
        
        setWishlistItems(updated);
        syncWithServer(updated, previousItems);
    }, [wishlistItems, syncWithServer]);

    const isInWishlist = useCallback((productId) => {
        return wishlistItems.some(item => (item._id || item) === productId);
    }, [wishlistItems]);

    const value = useMemo(() => ({
        wishlistItems,
        wishlistCount: wishlistItems.length,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist
    }), [wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist]);

    return (
        <WishlistContext.Provider value={value}>
            {!loading && children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
