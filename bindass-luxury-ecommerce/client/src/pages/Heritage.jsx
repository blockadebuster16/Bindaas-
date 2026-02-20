import React from 'react';

const Heritage = () => {
    return (
        <div className="bg-white font-['Manrope']">
            {/* Hero Section */}
            <section className="relative h-[85vh] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        alt="Vintage Tennis Heritage"
                        className="w-full h-full object-cover grayscale brightness-75"
                        src="https://images.unsplash.com/photo-1554062975-23b21bfe3664?q=80&w=2000&auto=format&fit=crop"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#10221c]/40 via-transparent to-[#10221c]/60" />
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <h2 className="text-sm md:text-base uppercase tracking-[0.4em] mb-4 font-bold">
                        The Legend Since 1933
                    </h2>
                    <h1 className="text-5xl md:text-8xl font-['Playfair_Display'] italic mb-8">
                        René L'Elegance
                    </h1>
                    <p className="max-w-xl mx-auto text-lg font-light opacity-90 leading-relaxed mb-10">
                        Inventor, champion, and visionary. Discover the journey of the man who
                        changed tennis and fashion forever.
                    </p>
                </div>
            </section>

            {/* Quote Section */}
            <section className="py-24 px-6 max-w-4xl mx-auto text-center" id="story">
                <div className="mb-12">
                    <span className="material-symbols-outlined text-[#11d490] text-5xl mb-6">
                        format_quote
                    </span>
                    <p className="text-3xl md:text-4xl font-['Playfair_Display'] italic text-gray-800 leading-snug">
                        "Without style, playing and winning are not enough."
                    </p>
                    <p className="mt-6 text-[#11d490] font-bold uppercase tracking-widest text-sm">
                        — The Founder
                    </p>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="relative py-20 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-6 space-y-32">
                    {/* 1933 */}
                    <div className="relative flex flex-col lg:flex-row items-center justify-between">
                        <div className="w-full lg:w-5/12 order-2 lg:order-1">
                            <img
                                alt="Original Polo"
                                className="w-full h-[500px] object-cover shadow-2xl grayscale"
                                src="https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=800"
                            />
                        </div>
                        <div className="w-full lg:w-5/12 order-1 lg:order-2 mb-12 lg:mb-0">
                            <div className="pl-0 lg:pl-16">
                                <span className="text-6xl font-bold text-gray-100">1933</span>
                                <h3 className="text-3xl font-['Playfair_Display'] mt-2 mb-6">The Revolution of the Piqué</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    Dissatisfied with the restrictive attire of the era, the brand revolutionized sportswear with the creation of the polo shirt.
                                </p>
                                <div className="h-[1px] w-20 bg-[#11d490] mb-6" />
                            </div>
                        </div>
                    </div>

                    {/* 1951 */}
                    <div className="relative flex flex-col lg:flex-row items-center justify-between">
                        <div className="w-full lg:w-5/12 order-1 mb-12 lg:mb-0">
                            <div className="pr-0 lg:pr-16 text-right">
                                <span className="text-6xl font-bold text-gray-100">1951</span>
                                <h3 className="text-3xl font-['Playfair_Display'] mt-2 mb-6">A Palette of Possibilities</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    Breaking away from traditional 'tennis white', L'Elegance introduces a range of vibrant colors.
                                </p>
                                <div className="h-[1px] w-20 bg-[#11d490] mb-6 ml-auto" />
                            </div>
                        </div>
                        <div className="w-full lg:w-5/12 order-2">
                            <img
                                alt="Colorful Polos"
                                className="w-full h-[500px] object-cover shadow-2xl"
                                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Heritage;