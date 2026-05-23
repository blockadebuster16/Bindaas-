import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const BASE_URL = `${API_BASE_URL}/api/wishlist`;

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load & Login/Logout Sync
    useEffect(() => {
        let isMounted = true;
        const loadWishlist = async () => {
            setLoading(true);
            if (user) {
                try {
                    const token = await user.getIdToken();
                    
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

    const syncWithServer = async (items) => {
        if (user) {
            try {
                const token = await user.getIdToken();
                const productIds = items.map(item => item._id || item);
                await axios.post(`${BASE_URL}/sync`,
                    { productIds },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Failed to sync wishlist to server:", err);
            }
        }
    };

    const addToWishlist = (product) => {
        if (wishlistItems.some(item => (item._id || item) === (product._id || product))) return;
        const updated = [...wishlistItems, product];
        setWishlistItems(updated);
        syncWithServer(updated);
    };

    const removeFromWishlist = (productId) => {
        const updated = wishlistItems.filter(item => (item._id || item) !== productId);
        setWishlistItems(updated);
        syncWithServer(updated);
    };

    const toggleWishlist = (product) => {
        const productId = product._id || product;
        const exists = wishlistItems.some(item => (item._id || item) === productId);
        let updated;
        if (exists) {
            updated = wishlistItems.filter(item => (item._id || item) !== productId);
        } else {
            updated = [...wishlistItems, product];
        }
        setWishlistItems(updated);
        syncWithServer(updated);
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => (item._id || item) === productId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            wishlistCount: wishlistItems.length,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist
        }}>
            {!loading && children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
