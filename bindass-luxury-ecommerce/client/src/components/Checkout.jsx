import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Checkout = () => {
    // Determine the number of items in the cart for the header badge
    const cartCount = JSON.parse(localStorage.getItem('bindass_cart'))?.length || 0;

    return (
        <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
            {/* Promo Bar */}
            <div className="w-full bg-white text-[#10221c] text-[10px] uppercase tracking-[0.2em] py-2 text-center font-bold border-b border-gray-100">
                Join Club Lacoste to enjoy exclusive benefits!
            </div>
            {/* Navigation Header */}
            <header className="sticky top-0 z-[100] bg-[#10221c] text-white font-display">
                {/* Top Row */}
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Left: Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                        {/* Icon */}
                        <div className="w-8 h-5 bg-white rounded-[2px] flex items-center justify-center">
                            <span className="material-icons-outlined text-[#10221c] text-sm">architecture</span>
                        </div>
                        {/* Text */}
                        <span className="text-xl font-extrabold tracking-tighter uppercase text-white">L'Elegance</span>
                    </Link>

                    {/* Center: Search */}
                    <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
                        <div className="relative group">
                            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004526]">search</span>
                            <input
                                type="text"
                                placeholder="Find a product"
                                className="w-full bg-white text-slate-900 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#004526] placeholder-slate-400 font-medium transition-shadow"
                            />
                        </div>
                    </div>

                    {/* Right: Utilities */}
                    <div className="flex items-center space-x-6 text-white">
                        <Link to="/" className="hover:text-emerald-400 transition-colors"><span className="material-icons-outlined">room</span></Link>
                        <Link to="/wishlist" className="hover:text-emerald-400 transition-colors"><span className="material-icons-outlined">favorite_border</span></Link>
                        <Link to="/profile" className="hover:text-emerald-400 transition-colors"><span className="material-icons-outlined">person_outline</span></Link>
                        <Link to="/cart" className="hover:text-emerald-400 transition-colors relative">
                            <span className="material-icons-outlined">shopping_bag</span>
                            <span className="absolute -top-1 -right-1 bg-white text-[#10221c] text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                                {cartCount}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Navigation Row */}
                <nav className="border-t border-white/10 relative">
                    <ul className="flex justify-center items-center flex-wrap gap-x-6 xl:gap-x-8 py-3 text-[11px] font-bold uppercase tracking-widest">
                        {/* India Exclusives */}
                        <li className="group static">
                            <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer py-2 px-2 -mx-2 bg-transparent group-hover:bg-[#152e26]">
                                India Exclusives
                                <span className="material-icons-outlined text-[14px]">expand_more</span>
                            </a>
                        </li>
                        {/* New In */}
                        <li className="group static">
                            <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer py-2 px-2 -mx-2 bg-transparent group-hover:bg-[#152e26]">
                                New In
                                <span className="material-icons-outlined text-[14px]">expand_more</span>
                            </a>
                        </li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors text-white">Men</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors text-white">Women</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors text-white">Kids</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors text-white">Sale</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors text-white">We Are Lacoste</a></li>
                    </ul>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Progress Stepper */}
                <div className="mb-12 max-w-3xl">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/10 -z-10 -translate-y-1/2"></div>
                        <div className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 pr-4">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Shipping</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 px-4">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-primary/20 text-slate-400 flex items-center justify-center font-bold">2</div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Payment</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 pl-4">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-primary/20 text-slate-400 flex items-center justify-center font-bold">3</div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Review</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Checkout Steps */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Section 1: Shipping Information */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <i className="material-icons text-primary">local_shipping</i>
                                    Shipping Information
                                </h2>
                            </div>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">First Name</label>
                                        <input className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg focus:ring-primary focus:border-primary px-4 py-3 outline-none" placeholder="René" type="text" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Last Name</label>
                                        <input className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg focus:ring-primary focus:border-primary px-4 py-3 outline-none" placeholder="Lacoste" type="text" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Street Address</label>
                                    <input className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg focus:ring-primary focus:border-primary px-4 py-3 outline-none" placeholder="28 Rue de la Paix" type="text" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">City</label>
                                        <input className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg focus:ring-primary focus:border-primary px-4 py-3 outline-none" placeholder="Paris" type="text" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Postal Code</label>
                                        <input className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg focus:ring-primary focus:border-primary px-4 py-3 outline-none" placeholder="75002" type="text" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Country</label>
                                        <select className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg focus:ring-primary focus:border-primary px-4 py-3 outline-none">
                                            <option>France</option>
                                            <option>USA</option>
                                            <option>UK</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email Address</label>
                                        <input className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg focus:ring-primary focus:border-primary px-4 py-3 outline-none" placeholder="rene@lacoste.com" type="email" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Phone Number</label>
                                        <input className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg focus:ring-primary focus:border-primary px-4 py-3 outline-none" placeholder="+33 1 23 45 67 89" type="tel" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-4">
                                    <input className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" id="save-info" type="checkbox" />
                                    <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="save-info">Save this information for next time</label>
                                </div>
                                <div className="pt-6">
                                    <button className="w-full md:w-auto px-12 py-4 bg-primary text-white font-bold rounded-lg hover:brightness-95 transition-all shadow-lg shadow-primary/20 uppercase tracking-widest" type="button">
                                        Continue to Payment
                                    </button>
                                </div>
                            </form>
                        </section>
                        {/* Section 2: Payment (Collapsed State Visual) */}
                        <section className="bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
                            <div className="flex items-center gap-3 opacity-50">
                                <i className="material-icons">payments</i>
                                <h2 className="text-xl font-bold">Payment Method</h2>
                            </div>
                        </section>
                        {/* Section 3: Review (Collapsed State Visual) */}
                        <section className="bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
                            <div className="flex items-center gap-3 opacity-50">
                                <i className="material-icons">fact_check</i>
                                <h2 className="text-xl font-bold">Review Order</h2>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sticky Order Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-28">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-primary/10 overflow-hidden">
                            <div className="p-6 border-b border-primary/5">
                                <h3 className="text-lg font-bold">Order Summary</h3>
                            </div>
                            {/* Item List */}
                            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                                <div className="flex gap-4">
                                    <div className="w-20 h-24 bg-white dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                        <img alt="Lacoste Classic Polo Shirt" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2gAHtoe8VAwxM3JsKR7tuFxGRYdiTC7Um8OPxLxq9nhdGxO4OdCH4zx19aP21-NU0TQ9YINqYjmlQm58keisznkyz3UpQuTk9TGsctSr-Fum3bxdshuSPgOWXB4ahXsWtPw8-UsRu4bXI_qfW_08lPF0_kRKohI6xVd0rS22L2MkC7sYaQ_cgQPnDRuOQ9cdSaDXQptswtKznyw4O8THTFMzhwhXPPtqwF0hrV8fyBCsm4aix4gwCEjkyTEh0blZuBsPGPePBjkSU" />
                                    </div>
                                    <div className="flex flex-col justify-between flex-grow py-1">
                                        <div>
                                            <h4 className="text-sm font-bold leading-tight">L.12.12 Classic Fit Cotton Petit Piqué Polo</h4>
                                            <p className="text-xs text-slate-500 mt-1 uppercase">Green • Size 4</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium">Qty: 1</span>
                                            <span className="text-sm font-bold">$110.00</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-20 h-24 bg-white dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                        <img alt="White Sneakers" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0V7vBlqpYe9QBDkgD9t96TL4YLe1sSuWQWvkTxKZuT8JcNk6LmskfcFOku1gHXHpnV9dbHaaI4murzgv16N8xmB_o0LXOtM0fux48lKhcGSH6J7Li6xEN-TWBkIe-dqgvv3PXv01ccuQJ6hWPBtExpkDbDHwV4Izrd7XqNElU3HXAZoyVvqZYrMMU-Sslu5DrdfpteyMxLIDdYC2sxM58z_rZffMHJRspdWbbAwJmpQF3oCcafgX1Rh95knmTvpSbFE0i2WI93ZCa" />
                                    </div>
                                    <div className="flex flex-col justify-between flex-grow py-1">
                                        <div>
                                            <h4 className="text-sm font-bold leading-tight">Men's Carnaby Evo Leather Sneakers</h4>
                                            <p className="text-xs text-slate-500 mt-1 uppercase">White • Size 10</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span class="text-xs font-medium">Qty: 1</span>
                                            <span class="text-sm font-bold">$125.00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Discount Code */}
                            <div className="px-6 py-4 border-t border-b border-primary/5 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex gap-2">
                                    <input className="flex-grow text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary px-3 outline-none" placeholder="Promo Code" type="text" />
                                    <button className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider hover:bg-slate-700 transition-colors">Apply</button>
                                </div>
                            </div>
                            {/* Pricing Breakdown */}
                            <div className="p-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-medium">$235.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="text-primary font-bold uppercase text-[10px] tracking-widest bg-primary/10 px-2 py-0.5 rounded">Free</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Estimated Tax</span>
                                    <span className="font-medium">$18.80</span>
                                </div>
                                <div className="pt-4 border-t border-primary/10 flex justify-between items-end">
                                    <span class="font-bold text-lg">Total</span>
                                    <span class="text-2xl font-bold text-slate-900 dark:text-white">$253.80</span>
                                </div>
                            </div>
                            {/* Trust Signals */}
                            <div className="px-6 pb-6 space-y-4">
                                <div className="flex items-center justify-center gap-6 text-slate-400 border-t border-primary/5 pt-6">
                                    <i className="material-icons">lock</i>
                                    <div className="flex gap-2 opacity-60 grayscale">
                                        <span className="text-[10px] font-bold border border-slate-400 px-1 rounded">VISA</span>
                                        <span className="text-[10px] font-bold border border-slate-400 px-1 rounded">AMEX</span>
                                        <span className="text-[10px] font-bold border border-slate-400 px-1 rounded">PAYPAL</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest">Secure Checkout Powered by SSL</p>
                            </div>
                        </div>
                        {/* Customer Support Note */}
                        <div className="mt-6 p-4 rounded-xl border border-primary/10 flex items-start gap-3 bg-white/50 dark:bg-slate-900/50">
                            <i className="material-icons text-primary text-sm">help_outline</i>
                            <div>
                                <p class="text-xs font-bold uppercase tracking-tight">Need Help?</p>
                                <p class="text-[10px] text-slate-500 mt-1">Our customer service team is available Mon-Fri, 9am - 6pm. Call us at 1-800-LACOSTE.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div>
                        <Link to="/" className="flex items-center space-x-2 mb-8">
                            <div className="w-8 h-5 bg-primary rounded-sm flex items-center justify-center">
                                <span className="material-icons-outlined text-white text-base">architecture</span>
                            </div>
                            <span className="text-xl font-extrabold tracking-tighter uppercase">L'Elegance</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed pr-4 font-light">
                            The intersection of athletic performance and high-fashion luxury. Iconic design for the modern individual.
                        </p>
                        <div className="flex space-x-4 mt-8">
                            <a className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#"><span className="material-icons-outlined text-xl">facebook</span></a>
                            <a className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#"><span className="material-icons-outlined text-xl">photo_camera</span></a>
                            <a className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#"><span className="material-icons-outlined text-xl">alternate_email</span></a>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-8">Collections</h5>
                        <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <li><a className="hover:text-primary transition-colors" href="#">The Iconic Polo</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Sport Performance</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Footwear Collection</a></li>
                            <li><a class="hover:text-primary transition-colors" href="#">Leather Goods</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Limited Editions</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-8">Help & Service</h5>
                        <ul class="space-y-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <li><a className="hover:text-primary transition-colors" href="#">Track Your Order</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Return Policy</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Size Guide</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Store Locator</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-8">Our Universe</h5>
                        <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <li><a className="hover:text-primary transition-colors" href="#">Our History</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Sustainability</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Collaborations</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Press</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                        © 2024 L'Elegance Fashion. All Rights Reserved.
                    </p>
                    <div className="flex space-x-6">
                        <a className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold hover:text-slate-900 transition-colors" href="#">Privacy Policy</a>
                        <a className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold hover:text-slate-900 transition-colors" href="#">Terms of Sale</a>
                        <a className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold hover:text-slate-900 transition-colors" href="#">Cookies</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Checkout;
