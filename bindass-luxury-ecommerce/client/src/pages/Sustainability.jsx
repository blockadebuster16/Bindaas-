import React from 'react';
import { Link } from 'react-router-dom';

const Sustainability = () => {
    return (
        <div className="bg-white min-h-screen font-['Manrope'] pb-20">
            {/* Hero Section */}
            <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <img 
                    src="/sustainability_hero_1776018537353.png" 
                    alt="Luxury Sustainability" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 text-center px-6">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6 leading-none">
                        Luxury Reimagined.<br/>Ethics Redefined.
                    </h1>
                    <p className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-[0.5em] max-w-xl mx-auto">
                        Defining the modern silhouette through conscious craftsmanship since 2026.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-24">
                {/* Intro Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
                    <div className="space-y-8">
                        <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">Our Philosophy</p>
                        <h2 className="text-3xl md:text-4xl font-black text-[#10221c] tracking-tighter uppercase leading-tight">
                            The BiNDAAS! Ethos: Quality Over Quantity.
                        </h2>
                        <div className="w-20 h-1 bg-[#10221c]" />
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            In an era of fleeting trends, we choose the path of permanence. Each BiNDAAS! piece is engineered to last a lifetime, reducing the need for constant consumption and honoring the raw materials harvested from our planet.
                        </p>
                    </div>
                    <div className="bg-slate-50 p-12 rounded-3xl border border-slate-100 italic font-medium text-slate-500 text-sm leading-relaxed">
                        "Luxury is not just about the final product; it's about the integrity of the journey that created it. At BiNDAAS!, we are architects of a cleaner, more ethical future for sportswear."
                    </div>
                </div>

                {/* The Three Pillars */}
                <div className="space-y-32">
                    {/* Pillar 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div className="order-2 md:order-1 space-y-6">
                            <span className="text-5xl font-black text-slate-100 leading-none select-none">01</span>
                            <h3 className="text-xl font-black text-[#10221c] uppercase tracking-tighter">Conscious Sourcing</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                We utilize high-end regenerated nylons (ECONYL®) and organic cottons. By sourcing materials that give back more than they take, we ensure that every BiNDAAS! garment carries a minimal environmental footprint without ever compromising on the luxe feel.
                            </p>
                        </div>
                        <div className="order-1 md:order-2 h-[400px] bg-slate-100 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                             <img src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1470" alt="Sourcing" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Pillar 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div className="h-[400px] bg-slate-100 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                             <img src="https://images.unsplash.com/photo-1563804862495-2ba19e625907?auto=format&fit=crop&q=80&w=1527" alt="Production" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-6">
                            <span className="text-5xl font-black text-slate-100 leading-none select-none">02</span>
                            <h3 className="text-xl font-black text-[#10221c] uppercase tracking-tighter">Ethical Craftsmanship</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Our artisans are the heartbeat of BiNDAAS!. We partner only with small-scale, highly vetted ateliers that guarantee living wages, safe conditions, and a culture of respect. We believe human dignity is the ultimate luxury.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div className="order-2 md:order-1 space-y-6">
                            <span className="text-5xl font-black text-slate-100 leading-none select-none">03</span>
                            <h3 className="text-xl font-black text-[#10221c] uppercase tracking-tighter">Circular Future</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                We are moving towards a 100% plastic-free supply chain. From our biodegradable shipping envelopes to our upcoming 'Archive Repair' program, we are designing for a circular world where nothing is wasted and everything is valued.
                            </p>
                        </div>
                        <div className="order-1 md:order-2 h-[400px] bg-slate-100 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                             <img src="https://images.unsplash.com/photo-1528698851307-a301686973fd?auto=format&fit=crop&q=80&w=1470" alt="Future" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* CTA Box */}
                <div className="mt-40 bg-[#10221c] rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-8">
                            Join the Conscious Collection.
                        </h2>
                        <Link to="/" className="inline-block bg-white text-[#10221c] px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all duration-300">
                            Discover More
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sustainability;
