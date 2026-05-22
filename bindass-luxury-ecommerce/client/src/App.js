import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Success from './pages/Success';
import SearchResults from './pages/SearchResults';

import ProductDetail from './pages/ProductDetail';
import Layout from './components/Layout';
import Checkout from './pages/Checkout';
import CheckoutPayment from './pages/CheckoutPayment';
import Heritage from './pages/Heritage';
import SportCollection from './pages/SportCollection';
import Membership from './pages/Membership';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Sustainability from './pages/Sustainability';
import FAQ from './pages/FAQ';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import OrdersManagement from './pages/OrdersManagement';
import AdminRoute from './components/AdminRoute';
import Apparel from './pages/Apparel';
import Men from './pages/Men';
import Women from './pages/Women';
import Classics from './pages/Classics';
import Sports from './pages/Sports';
import AdvertisementManager from './pages/AdvertisementManager';
import CouponManager from './pages/CouponManager';
import SettingsManager from './pages/SettingsManager';
import NexaDashboard from './pages/Nexa/NexaDashboard';
import NexaKB from './pages/Nexa/NexaKB';
import NexaLive from './pages/Nexa/NexaLive';
import NexaCases from './pages/Nexa/NexaCases';
import NexaChat from './pages/Nexa/NexaChat';
import NexaEmbed from './pages/Nexa/NexaEmbed';
import FormSubmissions from './pages/FormSubmissions';
import { AuthProvider } from './context/AuthContext';
import { CheckoutProvider } from './context/CheckoutContext';

function App() {
  return (
    <AuthProvider>
      <CheckoutProvider>
        <Routes>
          {/* Main Application Layout (Navbar + Footer) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/heritage" element={<Heritage />} />
            <Route path="/sport" element={<SportCollection />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/shop" element={<div className="min-h-screen flex items-center justify-center font-display text-xs uppercase tracking-widest text-slate-500 mt-16">Shop page coming soon...</div>} />
            <Route path="/apparel" element={<Apparel />} />
            <Route path="/men" element={<Men />} />
            <Route path="/women" element={<Women />} />
            <Route path="/classics" element={<Classics />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/payment" element={<CheckoutPayment />} />
            <Route path="/success" element={<Success />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/faq" element={<FAQ />} />
          </Route>
          
          {/* Admin Login (Unprotected) */}
          <Route path="/admin-login" element={<AdminLogin />} />

           {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
             <Route path="/admin" element={<AdminDashboard />} />
             <Route path="/admin/orders" element={<OrdersManagement />} />
             <Route path="/admin/advertisements" element={<AdvertisementManager />} />
             <Route path="/admin/coupons" element={<CouponManager />} />
             <Route path="/admin/settings" element={<SettingsManager />} />
             <Route path="/admin/nexa-dashboard" element={<NexaDashboard />} />
             <Route path="/admin/nexa-kb" element={<NexaKB />} />
             <Route path="/admin/nexa-live" element={<NexaLive />} />
             <Route path="/admin/nexa-cases" element={<NexaCases />} />
             <Route path="/admin/nexa-chat" element={<NexaChat />} />
             <Route path="/admin/nexa-embed" element={<NexaEmbed />} />
             <Route path="/admin/forms" element={<FormSubmissions />} />
          </Route>
        </Routes>
      </CheckoutProvider>
    </AuthProvider>
  );
}

export default App;