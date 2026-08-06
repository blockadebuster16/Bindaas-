import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const BASE_URL = `${API_BASE}/api/cart`;

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load & Login/Logout Sync
    useEffect(() => {
        let isMounted = true;
        const loadCart = async () => {
            setLoading(true);
            if (user) {
                try {
                    const token = localStorage.getItem("bindass_user_token");
                    // 1. Fetch DB Cart
                    const { data: dbCart } = await axios.get(BASE_URL, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // 2. Load any Guest Cart from local storage
                    const local = localStorage.getItem('bindass_cart');
                    const guestCart = local ? JSON.parse(local) : [];

                    if (guestCart.length > 0) {
                        // MERGE: guest items + db items
                        let merged = [...dbCart];
                        guestCart.forEach(gItem => {
                            const existsIndex = merged.findIndex(m => m.productId === gItem.productId && m.size === gItem.size);
                            if (existsIndex > -1) merged[existsIndex].quantity += gItem.quantity;
                            else merged.push(gItem);
                        });

                        // Push merged cart to DB (overwrite)
                        await axios.post(`${BASE_URL}/sync`,
                            { items: merged, overwrite: true },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (isMounted) setCartItems(merged);

                    } else {
                        // Normal login/reload, just use DB cart
                        if (isMounted) setCartItems(dbCart);
                    }

                    // Clear the guest cart so it doesn't merge again on next refresh
                    localStorage.removeItem('bindass_cart');
                } catch (err) {
                    console.error("Error loading cart:", err);
                }
            } else {
                // Not logged in: purely use guest local storage
                const local = localStorage.getItem('bindass_cart');
                if (isMounted) setCartItems(local ? JSON.parse(local) : []);
            }
            if (isMounted) setLoading(false);
        };

        loadCart();

        return () => { isMounted = false; };
    }, [user]);

    // Keep LocalStorage updated ONLY when user is not logged in (guest mode)
    useEffect(() => {
        if (!user) {
            localStorage.setItem('bindass_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const syncWithServer = async (items) => {
        if (user) {
            try {
                const token = localStorage.getItem("bindass_user_token");
                // Send overwrite flag so the backend directly saves this array
                await axios.post(`${BASE_URL}/sync`,
                    { items, overwrite: true },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Failed to sync cart to server:", err);
            }
        }
    };

    const addToCart = async (product) => {
        const exists = cartItems.find(item => item.productId === (product._id || product.productId) && item.size === product.size);
        let updatedCart;

        if (exists) {
            updatedCart = cartItems.map(item =>
                (item.productId === (product._id || product.productId) && item.size === product.size)
                    ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                    : item
            );
        } else {
            updatedCart = [...cartItems, {
                ...product,
                productId: product._id || product.productId,
                // crypto.randomUUID() is collision-free even when adding multiple items simultaneously
                cartId: crypto.randomUUID()
            }];
        }

        setCartItems(updatedCart);
        syncWithServer(updatedCart);
    };

    const addMultipleToCart = (products) => {
        const updatedCart = [...cartItems, ...products.map((p) => ({
            ...p,
            cartId: crypto.randomUUID()
        }))];
        setCartItems(updatedCart);
        syncWithServer(updatedCart);
    };

    const removeFromCart = async (cartId) => {
        const updatedCart = cartItems.filter(item => item.cartId !== cartId);
        setCartItems(updatedCart);
        syncWithServer(updatedCart);
    };

    const clearCart = async () => {
        setCartItems([]);
        syncWithServer([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, addMultipleToCart, removeFromCart, clearCart, setCartItems, cartCount: cartItems.length }}>
            {!loading && children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);


