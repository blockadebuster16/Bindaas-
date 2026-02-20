import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // To know when user logs in/out

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Cart from MongoDB when user logs in
    useEffect(() => {
        const fetchCart = async () => {
            if (user) {
                try {
                    const token = await user.getIdToken();
                    const { data } = await axios.get('http://localhost:5001/api/cart', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCartItems(data || []);
                } catch (err) {
                    console.error("Error fetching persistent cart:", err);
                }
            } else {
                // 2. Clear cart when user logs out
                setCartItems([]);
            }
            setLoading(false);
        };

        fetchCart();
    }, [user]);

    // 3. Global Add to Cart function (Syncs to DB automatically)
    const addToCart = async (product) => {
        const updatedCart = [...cartItems, { ...product, cartId: Date.now() }];
        setCartItems(updatedCart);
        syncCart(updatedCart);
    };

    // 4. Remove from Cart
    const removeFromCart = async (cartId) => {
        const updatedCart = cartItems.filter(item => item.cartId !== cartId);
        setCartItems(updatedCart);
        syncCart(updatedCart);
    };

    // 5. Clear Cart (for Checkout Success)
    const clearCart = async () => {
        setCartItems([]);
        syncCart([]);
    };

    // Helper to sync with DB
    const syncCart = async (items) => {
        if (user) {
            try {
                const token = await user.getIdToken();
                await axios.post('http://localhost:5001/api/cart/sync',
                    { items },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Failed to sync cart to server:", err);
            }
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, setCartItems, cartCount: cartItems.length }}>
            {!loading && children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);