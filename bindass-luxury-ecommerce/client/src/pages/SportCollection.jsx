import React from 'react';
import { Link } from 'react-router-dom';

const SportCollection = () => {
    return (
        <div className="bg-white font-['Manrope']">
            {/* Hero Section */}
            <section className="relative h-[85vh] overflow-hidden group">
                <img
                    alt="Athlete in technical sport apparel"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7808qIvwuvaB__KXj775ubfVz-WesZbrtFib_cgqLoUrSziunoBofXdZp-qAzZmYz3a7Hu43EcTCKpBbxIE4SiQ_9hc25gsP-B_DCuge4VFbKZC_530XEnodiEv-ijoXTzcrEg-FF8zL0z0KedoFzj7lFuz5TSBwvdkvP2qCeXHc8rLRCJky6nPChr3vVAC7-pAy308DY4mmcWvKi2u5xWW0F09MIErImZXqcSKEKrEgRuX5mOaUVOvnVfUFkeFgJugFfcHxKDrFR"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center">
                    <div className="max-w-7xl mx-auto px-6 w-full">
                        <div className="max-w-2xl text-white">
                            <span className="inline-block px-3 py-1 bg-[#11d490] text-[#10221c] text-xs font-bold tracking-widest uppercase mb-6">
                                New Performance Drop
                            </span>
                            <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-none mb-6">
                                Unstoppable
                                <br />
                                Motion.
                            </h1>
                            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-md font-light">
                                Engineered for the court, designed for the street. Experience the
                                new Ultra-Dry technical collection.
                            </p>
                            <div className="flex space-x-4">
                                <button className="bg-white text-[#10221c] px-10 py-4 font-bold uppercase tracking-widest hover:bg-[#11d490] hover:text-[#10221c] transition-all duration-300">
                                    Shop Tennis
                                </button>
                                <button className="border-2 border-white text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-white hover:text-[#10221c] transition-all duration-300">
                                    The Film
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid Section */}
            <section className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200">
                <div className="relative group cursor-pointer overflow-hidden border-r border-gray-200">
                    <div className="aspect-square md:aspect-auto md:h-[400px]">
                        <img
                            alt="Discover Our Commitments"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLJl6_9kzWVb21KvETH-YiDuq70EEhyGhCxkCrIP7FEbRupaKy4RrjEW4I2KDH69tsBzPoEuiYpk7kMLvLsZd74lfSsby0RckYgPPhMZepYFFQu2eRmdGzrcKqDry4F-FfEpUEcyXlJQcQYl1SG2mC2Sy9uHnukBllsveOIqncCACAHMuO2ABPmkbpEQ2nxXUMDiQjydINfsfA4E2RcphOFY-YXAkKStN2L1ai_FGPONyo-1fsVMhBFo6gpnfmDpkv0ZWBkvIKx9EL"
                        />
                    </div>
                    <div className="bg-[#10221c] p-5">
                        <h3 className="text-white text-sm font-bold uppercase tracking-widest">
                            Discover Our Commitments
                        </h3>
                    </div>
                </div>
                <div className="relative group cursor-pointer overflow-hidden border-r border-gray-200">
                    <div className="aspect-square md:aspect-auto md:h-[400px]">
                        <img
                            alt="Lacoste Story"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEMrSEzPbJ9GmnQA1CYxrKy6BqsX2havnYDz5Hu0tjwnSkkCu0LXwIQi9bP_0ZShAVgN9oh5_pxw2WSBJK9qN3k2EdkivVqejxAXsIqcgakMU_0qocLlmS37WPebrrmaGHr2_-2kubHm00gtAm4wMY2UFGBmgY8Hu0Bw_EgtEwrlCA1GXel1WwDMcYgZB6VMifQ-T9NvJXun4MKis-jFgZ2G4XkEOe4a9LkWjW6-FqDS__OsmiVboLsrwSABCo2rNtRZjGIfg3_lsl"
                        />
                    </div>
                    <div className="bg-[#10221c] p-5">
                        <h3 className="text-white text-sm font-bold uppercase tracking-widest">
                            L'Elegance Heritage
                        </h3>
                    </div>
                </div>
                <div className="relative group cursor-pointer overflow-hidden border-r border-gray-200">
                    <div className="aspect-square md:aspect-auto md:h-[400px]">
                        <img
                            alt="Lacoste Sport"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUOfWAZe4sw1wnRV1fxDj3-xW-cKywj2lseNBf5mGBRGvwvZ9YK1EPTwqTeaRW8Lw09hlpfI6jNAbB9Dn2gLElTvT3tMjJfF3Qix38d9b--Wh5txFIk1ci4qWfr1OreKkTkEw_EW1UPJB_kTTf5baYaN8EKh1n-Ldv4IefmhHSzcV5kuIVjwuoMLo535_IgncqPp28pQbu7waIA5EajuVYLbdCCakQ3hoYbnRkT1Tjg2dNWqN3y2YdEzwKG2LeoarCDMHsyO_LEKmH"
                        />
                    </div>
                    <div className="bg-[#10221c] p-5">
                        <h3 className="text-white text-sm font-bold uppercase tracking-widest">
                            Performance Line
                        </h3>
                    </div>
                </div>
                <Link to="/membership" className="relative group cursor-pointer overflow-hidden block">
                    <div className="aspect-square md:aspect-auto md:h-[400px]">
                        <img
                            alt="Le Club Lacoste"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBho86wbVAnCRpMQliCu8-Sz5t_yHIUP4LHv2-J-fz7CVFb0g8no771kH1i0O_WYtFlUOMWy0Z_rJqoHVyFgT-7GU02r3b4avqQQ97ROJlM6PD3i-J28uRiwyy-NEBhRosw2vKI_L9pvjGaBxBVXrE3e_z7HwFkcdSAxLoAwRQw2Xi7q9IeQVuLrqb7pgIkE6EmOB-c4Hp3RNATopj9XyKY8ZE-R5S135vAb32lnyn9nUSKcfkorEZovDE7NuDFJpppv9AtdyS6PejP"
                        />
                    </div>
                    <div className="bg-[#11d490] p-5 flex items-center justify-between">
                        <h3 className="text-[#10221c] text-sm font-bold uppercase tracking-widest">
                            Le Club Elite
                        </h3>
                        <span className="material-symbols-outlined text-[#10221c] text-lg">
                            arrow_forward
                        </span>
                    </div>
                </Link>
            </section>

            {/* Engineered Excellence Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black italic uppercase mb-4 tracking-tighter">
                                Engineered Excellence
                            </h2>
                            <p className="text-gray-600 max-w-xl">
                                Our technical collection combines heritage aesthetics with
                                cutting-edge textile innovation for peak performance.
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <button className="w-12 h-12 flex items-center justify-center border border-gray-300 hover:bg-[#11d490] transition-all">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="w-12 h-12 flex items-center justify-center border border-gray-300 hover:bg-[#11d490] transition-all">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Product Card 1 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                                <img
                                    alt="Men's Technical Polo"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_nX9HH6IkbV7nh9ywV2HXWH989LMe6rfMwNWFSK6ivAz4b0cWIb2mx0DLfCwVl-qDOwbqLlh46EutVt3YiwjDp9vvuqEhmo8BbrK3ScKTiRof9FVd5cRxhchu6LWjaEetBzCYTK-1oKUvkw5P6Wdy0I7-6H6D-Ll84Q7f7C3OGayLGAU_vRzMJsjEqR6O2HlPS5HjDjIOq0-AQmRhsnLIpYOhxZ_iYWfZDPKqk2ryxphoNO2zml4UwhybKctm9r5iojzWXaXmcaw2"
                                />
                                <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-[#11d490]">
                                    Ultra-Dry
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform bg-white/95 backdrop-blur-sm">
                                    <p className="text-xs uppercase font-bold tracking-widest text-[#11d490] mb-1">
                                        Tech Highlight
                                    </p>
                                    <p className="text-sm font-medium">
                                        Moisture-wicking fabric designed for high-intensity matches.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold uppercase text-sm tracking-tight">
                                        Performance Stretch Polo
                                    </h4>
                                    <p className="text-gray-500 text-sm">Activewear • White / Navy</p>
                                </div>
                                <p className="font-bold">$110</p>
                            </div>
                        </div>

                        {/* Product Card 2 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                                <img
                                    alt="Technical Shorts"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd2TDNpAYi5zBEwFpoyY1XxJ4rs59OxUhxyYQpF51gvGBKKSDlqWcB_IK1cFFf1szROQOcYjLT9Es4nlL2itLvm_gAOusMbouRMV2k9vyTDwhhENxBBrWpp_hLVjDfnb2tsTWmJWQvJTopWtSVaFUNrfhBMwrHlstJV2V2AbW8L5BU0oQakgROf2dLoYJqEOXaiv27hPnK1IbFFhwXjIf2Kt5jK9vtxXwgU8bdQMF4UmNDCZZVQo8jVL9qqxdAYBrhqkR5TOrR00jr"
                                />
                                <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-[#11d490]">
                                    Stretch Tafetta
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform bg-white/95 backdrop-blur-sm">
                                    <p className="text-xs uppercase font-bold tracking-widest text-[#11d490] mb-1">
                                        Tech Highlight
                                    </p>
                                    <p className="text-sm font-medium">
                                        Four-way stretch for unrestricted lateral movement.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold uppercase text-sm tracking-tight">
                                        Tennis Lightweight Shorts
                                    </h4>
                                    <p className="text-gray-500 text-sm">Sport • Emerald Green</p>
                                </div>
                                <p className="font-bold">$85</p>
                            </div>
                        </div>

                        {/* Product Card 3 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                                <img
                                    alt="Ultra-Light Jacket"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzb7d-z5PuEGzv7bjV1fCI1JOtNGDa0nvkQhq7N3viUGasjX5ijz30Q1YoSp-yH74mk47wcpYt-uhcIyjTLlX1bV8g7tgieCKybyp319SszwnVJHEUlHvuPmXH2dh7BC5-_P1W0lKPwUfjHawWwqJGrfluDjmR51rfQ9lSFP-kgAibPmJFJr0oRO41AifbCGdy2B1037Xw17vJpasoOCNi_Ot_s381xTZ2z7w4TgFU4ye73qq3f9qWWTyvB1w4o2mpPdDsFrDFPbM9"
                                />
                                <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-[#11d490]">
                                    Water Repellent
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform bg-white/95 backdrop-blur-sm">
                                    <p className="text-xs uppercase font-bold tracking-widest text-[#11d490] mb-1">
                                        Tech Highlight
                                    </p>
                                    <p className="text-sm font-medium">
                                        Breathable mesh lining with a wind-resistant outer shell.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold uppercase text-sm tracking-tight">
                                        Technical Zip Windbreaker
                                    </h4>
                                    <p className="text-gray-500 text-sm">
                                        Outdoor Sport • Deep Black
                                    </p>
                                </div>
                                <p className="font-bold">$185</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Split Banner Section */}
            <section className="flex flex-col md:flex-row h-[70vh]">
                <div className="relative flex-1 group overflow-hidden">
                    <img
                        alt="Tennis Collection"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt4u7IlDblOBaZJFwR-dpSy5hgdLP-UYLBzoIhJVtBVkCLF_s6jTgypCVaO-5JR-sSAYgy4CrkJ5Y2_ikNEE6OgPodOFi3iyTLGNQVpB5-1vM8PnxNpViU9y-yJBn1_fNE9HGiMyhFKaun5lsBGik02gbJZK48OVu4pE-TV_eDAn1fG0Ph4vNvmoqosc-0H0sV8gCmE0GlQWUwg-t35r6-mcL-BQOe63GZheBTdu3qSeDg5A35XIYlugSuxysay0bKcreRH80wNKrS"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-6">
                                Court Kings
                            </h2>
                            <button className="bg-white text-[#10221c] px-8 py-3 font-bold uppercase tracking-widest hover:bg-[#11d490] hover:text-[#10221c] transition-all">
                                Shop Tennis
                            </button>
                        </div>
                    </div>
                </div>
                <div className="relative flex-1 group overflow-hidden border-t md:border-t-0 md:border-l border-white/10">
                    <img
                        alt="Golf Collection"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFHsqzc_HAtaMEcqPxoY_EFIYCoPQ-gxUf5w6uMxdLLtDKwlRWzVHogpFOx1_Gh6C5Y0Sdqq6fnPSRZQq4zAHmbuF8k4teDawpkwznMQYkKIpkAUxRV_Hz6q4QXnEeQfN8OskVI-VR_592HvBmGK3rWCMGPC3MO8id3rGWp2FiIJeJQFz4aRwzThZICp-qVVjpbLuT8LmefB0yJM_utrBMoWbbs_xAlyrFBE8UdJ7RMm3MjIzEO8Fv05tkzi7409Sg6ts_ugQ4Ppnb"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-6">
                                Pro Green
                            </h2>
                            <button className="bg-white text-[#10221c] px-8 py-3 font-bold uppercase tracking-widest hover:bg-[#11d490] hover:text-[#10221c] transition-all">
                                Shop Golf
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-20 border-t border-gray-200">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-black uppercase italic mb-4">
                        Join L'Elegance Elite
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Receive early access to collections and exclusive sporting events.
                    </p>
                    <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                        <input
                            className="flex-1 bg-transparent border-gray-300 focus:border-[#11d490] focus:ring-[#11d490] px-4 py-3 text-sm font-bold uppercase tracking-widest outline-none"
                            placeholder="ENTER YOUR EMAIL"
                            type="email"
                        />
                        <button className="bg-[#10221c] text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-[#11d490] hover:text-[#10221c] transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default SportCollection;
