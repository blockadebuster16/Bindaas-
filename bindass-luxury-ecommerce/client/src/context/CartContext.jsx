import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const BASE_URL = `${API_BASE_URL}/api/cart`;

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper to format raw DB elements to ensure they always possess a operational client identifier
    const normaliseCartItems = (items) => {
        return items.map((item, index) => ({
            ...item,
            productId: item.productId || item._id,
            // FIXED: Fallback to array index + timestamp if cartId isn't stored in DB
            cartId: item.cartId || `${item.productId || item._id}-${item.size}-${Date.now()}-${index}`
        }));
    };

    // Initial load & Login/Logout Sync
    useEffect(() => {
        let isMounted = true;
        const loadCart = async () => {
            setLoading(true);
            if (user) {
                try {
                    const token = await user.getIdToken();
                    // 1. Fetch DB Cart
                    const { data: dbCart } = await axios.get(BASE_URL, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    // Normalise database items to guarantee cartId exists
                    let processedDbCart = normaliseCartItems(dbCart);
                    
                    // 2. Load any Guest Cart from local storage
                    const local = localStorage.getItem('bindass_cart');
                    const guestCart = local ? JSON.parse(local) : [];
                    
                    if (guestCart.length > 0) {
                        // MERGE: guest items + db items without mutating underlying objects
                        let merged = [...processedDbCart];
                        
                        guestCart.forEach(gItem => {
                           const existsIndex = merged.findIndex(m => m.productId === gItem.productId && m.size === gItem.size);
                           if (existsIndex > -1) {
                               // FIXED: Immutable object assignment update
                               merged[existsIndex] = {
                                   ...merged[existsIndex],
                                   quantity: merged[existsIndex].quantity + gItem.quantity
                               };
                           } else {
                               merged.push({
                                   ...gItem,
                                   cartId: gItem.cartId || `${gItem.productId}-${gItem.size}-${Date.now()}`
                               });
                           }
                        });
                        
                        // Push merged cart to DB (overwrite)
                        await axios.post(`${BASE_URL}/sync`, 
                            { items: merged, overwrite: true },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        if (isMounted) setCartItems(merged);
                        
                    } else {
                        if (isMounted) setCartItems(processedDbCart);
                    }
                    
                    localStorage.removeItem('bindass_cart');
                } catch (err) {
                    console.error("Error loading cart:", err);
                }
            } else {
                // Not logged in: purely use guest local storage
                const local = localStorage.getItem('bindass_cart');
                if (isMounted) setCartItems(local ? normaliseCartItems(JSON.parse(local)) : []);
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

    // Wrapped in useCallback to prevent unneeded downstream rerender cycles
    const syncWithServer = useCallback(async (items) => {
        if (user) {
            try {
                const token = await user.getIdToken();
                await axios.post(`${BASE_URL}/sync`,
                    { items, overwrite: true },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Failed to sync cart to server:", err);
            }
        }
    }, [user]);

    const addToCart = async (product) => {
        const targetProductId = product._id || product.productId;
        const exists = cartItems.find(item => item.productId === targetProductId && item.size === product.size);
        let updatedCart;
        
        if (exists) {
            updatedCart = cartItems.map(item => 
                (item.productId === targetProductId && item.size === product.size)
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            );
        } else {
            updatedCart = [...cartItems, { 
                ...product, 
                productId: targetProductId, 
                cartId: `${targetProductId}-${product.size}-${Date.now()}`
            }];
        }
        
        setCartItems(updatedCart);
        syncWithServer(updatedCart);
    };

    const addMultipleToCart = (products) => {
        let updatedCart = [...cartItems];
        
        products.forEach((p, i) => {
            const targetProductId = p._id || p.productId;
            const existsIndex = updatedCart.findIndex(item => item.productId === targetProductId && item.size === p.size);
            
            if (existsIndex > -1) {
                updatedCart[existsIndex] = {
                    ...updatedCart[existsIndex],
                    quantity: updatedCart[existsIndex].quantity + (p.quantity || 1)
                };
            } else {
                updatedCart.push({
                    ...p,
                    productId: targetProductId,
                    cartId: `${targetProductId}-${p.size}-${Date.now()}-${i}`
                });
            }
        });

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

    // Calculate aggregated item quantity safely dynamically
    const cartCount = cartItems.reduce((acc, current) => acc + (current.quantity || 0), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, addMultipleToCart, removeFromCart, clearCart, setCartItems, cartCount }}>
            {!loading && children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
