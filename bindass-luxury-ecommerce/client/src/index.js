import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { GeoProvider, useGeo } from './context/GeoContext';
import { MembershipProvider } from './context/MembershipContext';
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <GeoProvider>
                <GeoAwareCurrencyProvider>
                    <CartProvider>
                        <WishlistProvider>
                            <RecentlyViewedProvider>
                                <MembershipProvider>
                                    <BrowserRouter>
                                        <App />
                                    </BrowserRouter>
                                </MembershipProvider>
                            </RecentlyViewedProvider>
                        </WishlistProvider>
                    </CartProvider>
                </GeoAwareCurrencyProvider>
            </GeoProvider>
        </AuthProvider>
    </React.StrictMode>
);