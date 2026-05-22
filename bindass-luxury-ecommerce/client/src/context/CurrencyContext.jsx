import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

// Static Dictionary for conversion (Base: INR)
const STATIC_RATES = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0094,
    CAD: 0.016,
    AUD: 0.018,
    AED: 0.044,
    JPY: 1.83,
    CNY: 0.086,
    SGD: 0.016,
    HKD: 0.094,
    NZD: 0.020
};

export const CurrencyProvider = ({ children, geoCurrencyCode }) => {
    const [currencyCode, setCurrencyCode] = useState('INR');
    const [exchangeRate, setExchangeRate] = useState(1);

    useEffect(() => {
        try {
            // Priority 1: Geo-detected currency (from GeoContext → passed as prop)
            if (geoCurrencyCode && STATIC_RATES[geoCurrencyCode]) {
                setCurrencyCode(geoCurrencyCode);
                setExchangeRate(STATIC_RATES[geoCurrencyCode]);
                return;
            }

            // Priority 2: Timezone-based fallback (offline, instant)
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            let detectedCurrency = 'INR';
            if (tz.startsWith('America/')) detectedCurrency = tz.includes('Toronto') || tz.includes('Vancouver') ? 'CAD' : 'USD';
            else if (tz.startsWith('Europe/')) detectedCurrency = tz.includes('London') ? 'GBP' : 'EUR';
            else if (tz.startsWith('Australia/')) detectedCurrency = 'AUD';
            else if (tz.includes('Auckland')) detectedCurrency = 'NZD';
            else if (tz.includes('Asia/Dubai')) detectedCurrency = 'AED';
            else if (tz.includes('Asia/Tokyo')) detectedCurrency = 'JPY';
            else if (tz.includes('Asia/Shanghai')) detectedCurrency = 'CNY';
            else if (tz.includes('Asia/Singapore')) detectedCurrency = 'SGD';

            const rate = STATIC_RATES[detectedCurrency] || 1;
            setCurrencyCode(detectedCurrency);
            setExchangeRate(rate);
        } catch (error) {
            console.error('Currency detection failed:', error);
            setCurrencyCode('INR');
            setExchangeRate(1);
        }
    }, [geoCurrencyCode]); // Re-run when geo data arrives

    const formatPrice = (priceInINR) => {
        if (!priceInINR) return '';
        const converted = priceInINR * exchangeRate;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(converted);
    };

    const getConvertedAmount = (priceInINR) => {
        if (!priceInINR) return 0;
        return Number((priceInINR * exchangeRate).toFixed(2));
    };

    // Allow manual override (user-initiated currency switcher)
    const setCurrency = (code) => {
        if (STATIC_RATES[code]) {
            setCurrencyCode(code);
            setExchangeRate(STATIC_RATES[code]);
        }
    };

    return (
        <CurrencyContext.Provider value={{
            currencyCode,
            exchangeRate,
            formatPrice,
            getConvertedAmount,
            setCurrency,
            availableCurrencies: Object.keys(STATIC_RATES)
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
