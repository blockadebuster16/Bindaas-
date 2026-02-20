import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// DYNAMIC URL: Uses localhost for dev, and relative path for Vercel production
const BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api/cart' 
    : '/api/cart';

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCart = async () => {
            if (user) {
                try {
                    const token = await user.getIdToken();
                    const { data } = await axios.get(BASE_URL, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCartItems(data || []);
                } catch (err) {
                    console.error("Error fetching persistent cart:", err);
                }
            } else {
                setCartItems([]);
            }
            setLoading(false);
        };

        fetchCart();
    }, [user]);

    const syncCart = async (items) => {
        if (user) {
            try {
                const token = await user.getIdToken();
                await axios.post(`${BASE_URL}/sync`,
                    { items },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Failed to sync cart to server:", err);
            }
        }
    };

    const addToCart = async (product) => {
        // Prevent duplicates or handle quantity logic here if needed
        const updatedCart = [...cartItems, { ...product, cartId: Date.now() }];
        setCartItems(updatedCart);
        syncCart(updatedCart);
    };

    const removeFromCart = async (cartId) => {
        const updatedCart = cartItems.filter(item => item.cartId !== cartId);
        setCartItems(updatedCart);
        syncCart(updatedCart);
    };

    const clearCart = async () => {
        setCartItems([]);
        syncCart([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, setCartItems, cartCount: cartItems.length }}>
            {!loading && children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
