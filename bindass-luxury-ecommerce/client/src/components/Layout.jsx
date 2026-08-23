import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SignInModal from './SignInModal';
import CookieBanner from './CookieBanner';

const Layout = () => {
    return (
        <div className="min-h-screen bg-white selection:bg-black selection:text-white relative w-full flex flex-col">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
            <SignInModal />
            <CookieBanner />
        </div>
    );
};

export default Layout;
