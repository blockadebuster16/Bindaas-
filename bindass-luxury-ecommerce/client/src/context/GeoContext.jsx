import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const GeoContext = createContext();

const GEO_URL = 'http://localhost:5001/api/geo/zone';
const CACHE_KEY = 'bindass_geo_zone';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

export const GeoProvider = ({ children }) => {
    const [geoData, setGeoData] = useState(null);  // { countryCode, countryName, zone }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const detectZone = async () => {
            // ── Try cache first ───────────────────────────────────────────────
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, ts } = JSON.parse(cached);
                    if (Date.now() - ts < CACHE_TTL_MS) {
                        setGeoData(data);
                        setLoading(false);
                        return;
                    }
                }
            } catch (_) { /* ignore corrupt cache */ }

            // ── Fetch from backend ────────────────────────────────────────────
            try {
                const { data } = await axios.get(GEO_URL, { timeout: 4000 });
                setGeoData(data);
                localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
            } catch (err) {
                console.warn('Geo detection failed, defaulting to India zone:', err.message);
                // Graceful fallback
                const fallback = {
                    countryCode: 'IN',
                    countryName: 'India',
                    zone: {
                        zone_name: 'INDIA', display_name: 'India',
                        currency_code: 'INR', currency_symbol: '₹',
                        base_shipping_fee: 250, free_shipping_threshold: 40000,
                        vat_rate: 18, de_minimis: 0, duty_note: null, climate_fee: 25,
                        isIndia: true, isInternational: false
                    }
                };
                setGeoData(fallback);
            } finally {
                setLoading(false);
            }
        };

        detectZone();
    }, []);

    return (
        <GeoContext.Provider value={{ geoData, loading }}>
            {children}
        </GeoContext.Provider>
    );
};

export const useGeo = () => useContext(GeoContext);
