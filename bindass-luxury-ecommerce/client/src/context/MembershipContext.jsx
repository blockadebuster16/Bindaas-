import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const MembershipContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const BASE_URL = `${API_BASE}/api/membership`;

export const MembershipProvider = ({ children }) => {
    const { user } = useAuth();
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTier = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem("bindass_user_token");
                    const { data } = await axios.get(`${BASE_URL}/my-tier`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setMembership(data);
                } catch (error) {
                    console.error("Failed to fetch membership:", error);
                }
            } else {
                setMembership(null);
            }
            setLoading(false);
        };
        fetchTier();
    }, [user]);

    return (
        <MembershipContext.Provider value={{ membership, loading }}>
            {children}
        </MembershipContext.Provider>
    );
};

export const useMembership = () => useContext(MembershipContext);


