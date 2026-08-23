import React, { Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CheckoutProvider } from './context/CheckoutContext';
import ErrorBoundary from './components/ErrorBoundary';
import SmoothScroll from './components/SmoothScroll';
import PageLoader from './components/shared/PageLoader';
import ScrollToTop from './components/ScrollToTop';
import axios from 'axios';

const Home = React.lazy(() => import('./pages/Home'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Success = React.lazy(() => import('./pages/Success'));
const SearchResults = React.lazy(() => import('./pages/SearchResults'));

const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Layout = React.lazy(() => import('./components/Layout'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const CheckoutPayment = React.lazy(() => import('./pages/CheckoutPayment'));
const Heritage = React.lazy(() => import('./pages/Heritage'));
const SportCollection = React.lazy(() => import('./pages/SportCollection'));
const Membership = React.lazy(() => import('./pages/Membership'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Terms = React.lazy(() => import('./pages/Terms'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const Sustainability = React.lazy(() => import('./pages/Sustainability'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const OrdersManagement = React.lazy(() => import('./pages/OrdersManagement'));
const AdminRoute = React.lazy(() => import('./components/AdminRoute'));
const Apparel = React.lazy(() => import('./pages/Apparel'));
const Men = React.lazy(() => import('./pages/Men'));
const Women = React.lazy(() => import('./pages/Women'));
const Classics = React.lazy(() => import('./pages/Classics'));
const Sports = React.lazy(() => import('./pages/Sports'));
const AdvertisementManager = React.lazy(() => import('./pages/AdvertisementManager'));
const PageLayoutManager = React.lazy(() => import('./pages/PageLayoutManager'));
const CouponManager = React.lazy(() => import('./pages/CouponManager'));
const SettingsManager = React.lazy(() => import('./pages/SettingsManager'));
const NexaDashboard = React.lazy(() => import('./pages/Nexa/NexaDashboard'));
const NexaKB = React.lazy(() => import('./pages/Nexa/NexaKB'));
const NexaLive = React.lazy(() => import('./pages/Nexa/NexaLive'));
const NexaCases = React.lazy(() => import('./pages/Nexa/NexaCases'));
const NexaChat = React.lazy(() => import('./pages/Nexa/NexaChat'));
const NexaEmbed = React.lazy(() => import('./pages/Nexa/NexaEmbed'));
const FormSubmissions = React.lazy(() => import('./pages/FormSubmissions'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const AuthGuard = React.lazy(() => import('./components/AuthGuard')); // ROUTE-001
const Shop = React.lazy(() => import('./pages/Shop')); // ROUTE-002
const OutreachDashboard = React.lazy(() => import('./pages/OutreachDashboard'));

function App() {
  // ROUTE-004 FIX: Intercept 401s on admin routes and redirect to login
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 401 &&
          window.location.pathname.startsWith('/admin')
        ) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin-login';
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);
  return (
    <ErrorBoundary>
      <CheckoutProvider>
        <SmoothScroll>
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/shop" element={<Shop />} />
              <Route path="/apparel" element={<Apparel />} />
              <Route path="/men" element={<Men />} />
              <Route path="/women" element={<Women />} />
              <Route path="/classics" element={<Classics />} />
              <Route path="/sports" element={<Sports />} />
              {/* ROUTE-001 FIX: Auth-guarded checkout routes */}
              <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
              <Route path="/checkout/payment" element={<AuthGuard><CheckoutPayment /></AuthGuard>} />
              <Route path="/success" element={<Success />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/faq" element={<FAQ />} />
              {/* 404 — Catch all unknown routes under Layout */}
              <Route path="*" element={
                <div className="min-h-screen flex flex-col items-center justify-center bg-bindas-parchment px-6 font-sans text-center gap-6">
                  <div className="w-16 h-16 bg-bindas-onyx rounded-2xl flex items-center justify-center">
                    <span className="text-bindas-amber text-3xl font-black">4</span>
                    <span className="text-bindas-amber text-3xl font-black">0</span>
                    <span className="text-bindas-amber text-3xl font-black">4</span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-bindas-onyx tracking-tight">Page Not Found</h1>
                  <p className="text-sm text-[#6B6457] max-w-sm leading-relaxed">The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
                  <a href="/" className="btn-primary rounded-xl px-8 py-3 text-sm">← Back to Home</a>
                </div>
              } />
            </Route>
            
            {/* Google OAuth callback — outside Layout, no navbar/footer */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Admin Login (Unprotected) */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<OrdersManagement />} />
              <Route path="/admin/advertisements" element={<AdvertisementManager />} />
              <Route path="/admin/page-layouts" element={<PageLayoutManager />} />
              <Route path="/admin/coupons" element={<CouponManager />} />
              <Route path="/admin/settings" element={<SettingsManager />} />
              <Route path="/admin/nexa-dashboard" element={<NexaDashboard />} />
              <Route path="/admin/nexa-kb" element={<NexaKB />} />
              <Route path="/admin/nexa-live" element={<NexaLive />} />
              <Route path="/admin/nexa-cases" element={<NexaCases />} />
              <Route path="/admin/nexa-chat" element={<NexaChat />} />
              <Route path="/admin/nexa-embed" element={<NexaEmbed />} />
              <Route path="/admin/forms" element={<FormSubmissions />} />
              <Route path="/admin/outreach" element={<OutreachDashboard />} />
            </Route>
          </Routes>
          </Suspense>
        </SmoothScroll>
      </CheckoutProvider>
    </ErrorBoundary>
  );
}

export default App;