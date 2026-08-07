import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { GeoProvider, useGeo } from './context/GeoContext';
import { MembershipProvider } from './context/MembershipContext';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import clarity from '@microsoft/clarity';
import './styles/index.css';


// Initialize Microsoft Clarity
if (process.env.REACT_APP_CLARITY_ID) {
    clarity.init(process.env.REACT_APP_CLARITY_ID);
}

// Inner wrapper so CurrencyProvider can read from GeoContext
const GeoAwareCurrencyProvider = ({ children }) => {
    const { geoData } = useGeo();
    const geoCurrency = geoData?.zone?.currency_code || null;
    return (
        <CurrencyProvider geoCurrencyCode={geoCurrency}>
            {children}
        </CurrencyProvider>
    );
};

// Initialize React Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 30 * 60 * 1000, // 30 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <AuthProvider>
                    <GeoProvider>
                        <GeoAwareCurrencyProvider>
                            <CartProvider>
                                <WishlistProvider>
                                    <RecentlyViewedProvider>
                                        <MembershipProvider>
                                            <HelmetProvider>
                                                <BrowserRouter>
                                                    <App />
                                                </BrowserRouter>
                                            </HelmetProvider>
                                        </MembershipProvider>
                                    </RecentlyViewedProvider>
                                </WishlistProvider>
                            </CartProvider>
                        </GeoAwareCurrencyProvider>
                    </GeoProvider>
                </AuthProvider>
            </ToastProvider>
        </QueryClientProvider>
    </React.StrictMode>
);