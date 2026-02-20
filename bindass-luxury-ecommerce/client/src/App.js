import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home'; // Moved Home to /pages for better structure
import Cart from './pages/Cart';
import Footer from './components/Footer'; // 1. Import it
import Profile from './pages/Profile';
import Success from './pages/Success';

import ProductDetail from './pages/ProductDetail';
import Layout from './components/Layout';
import Checkout from './pages/Checkout';
import Checkout2 from './pages/Checkout2';
import Checkout3 from './pages/Checkout3';
import Heritage from './pages/Heritage';
import SportCollection from './pages/SportCollection';
import Membership from './pages/Membership';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Main Application Layout (Navbar + Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/heritage" element={<Heritage />} />
          <Route path="/sport" element={<SportCollection />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/membership" element={<Membership />} />
        </Route>


        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/payment" element={<Checkout2 />} />
        <Route path="/checkout/review" element={<Checkout3 />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;