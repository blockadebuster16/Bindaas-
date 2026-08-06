import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Membership = () => {
    const { signUpWithEmail, updateUserProfile } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { user } = await signUpWithEmail(formData.email, formData.password);
            await updateUserProfile(user, {
                displayName: `${formData.firstName} ${formData.lastName}`
            });
            alert("Welcome to Le Club BiNDAAS!");
            navigate('/profile');
        } catch (error) {
            console.error("Signup failed:", error);
            alert(error.message);
        }
    };
    return (
        <>
            <meta charSet="utf-8" />
            <meta content="width=device-width, initial-scale=1.0" name="viewport" />
            <title>L'Elegance - Premium Membership</title>
            <link
                href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap"
                rel="stylesheet"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                rel="stylesheet"
            />
            <style
                type="text/tailwindcss"
                dangerouslySetInnerHTML={{
                    __html:
                        "\n        :root {\n            --primary-color: #11d490;\n            --brand-dark: #10221c;\n        }\n        body {\n            \n        }\n        .material-symbols-outlined {\n            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;\n        }\n    "
                }}
            />

            <section className="relative h-[75vh] flex items-center overflow-hidden font-['Manrope']">
                <img
                    alt="Diverse group of stylish people"
                    className="absolute inset-0 w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXrDRzUIdh-50zd9J7n393fLJuehJ1uq2UOzE6pcaMvbR4CMgk4acP-fZ5ba7oln6AGXxjwAZ3dyChB6kh6LWfx51dAhrn76D_WTrYZbp0o3A_oauD5lSkreFJJXr6K6K8-NpHWczqxbRLuLKcxxAiISxToZSwuMNRa3dfPZs2kIA_mJyZjhTzV_EuyxxyY45tlv75nL_xQRHBKUZp78bwO8IyAbiuqtgReuyTUgJpKxffPVKOJ1x_UqQt1mZzr-kDAoFSewcR758E"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#10221c]/70 to-transparent" />
                <div className="relative max-w-7xl mx-auto px-6 w-full text-white">
                    <div className="max-w-2xl">
                        <div className="inline-block bg-[#11d490] text-[#10221c] px-4 py-1 mb-6 font-bold tracking-tighter italic">
                            L'ELEGANCE PRIVILEGE
                        </div>
                        <h1 className="text-6xl md:text-8xl font-serif italic mb-6 leading-tight font-['Playfair_Display']">
                            Beyond the <br />
                            Court.
                        </h1>
                        <p className="text-lg md:text-xl mb-10 text-slate-200 leading-relaxed max-w-lg">
                            Join our exclusive membership and unlock a world of sporting elegance,
                            curated rewards, and personalized services.
                        </p>
                        <a
                            className="inline-block bg-[#11d490] text-[#10221c] hover:bg-white px-10 py-5 font-bold uppercase tracking-widest transition-all duration-300"
                            href="#join"
                        >
                            Join The Club
                        </a>
                    </div>
                </div>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200 font-['Manrope']">
                <div className="group relative h-64 overflow-hidden border-r border-slate-200">
                    <img
                        alt="Sustainability commitment"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtpc3VParyxZ-0YbU7JGAIoibKjusRc09ZhZB5NcVWSueSAttINRpnEXbZqRWgRa4KSK0NUAnVKwxfi7oD6IXkLMXdEzzlyIlJX2z5fFjYZEo3R7N13V5F-7vvm0nZBeJxByOEHPutbswRcUBnvbJ4yXOK5thuwiuLZ26d2zSKHMIM3cuaR6avVk_rEiK5Wvy1Ss1M0ISSRWURtRRLUjm49v7STeZG63kqssXxejBvlDhnGCRQYDPczCRvMewDofFYd3AifTuNUSsI"
                    />
                    <div className="absolute inset-0 bg-[#10221c]/20 group-hover:bg-[#10221c]/40 transition-colors" />
                    <div className="absolute bottom-0 w-full p-4 bg-[#10221c] text-white text-xs font-bold uppercase tracking-widest">
                        Our Commitments
                    </div>
                </div>
                <div className="group relative h-64 overflow-hidden border-r border-slate-200">
                    <img
                        alt="Legacy history"
                        className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI0ezSmdM4LMNqVaw3Pa8xXsqoyJyOauC0TUoMDZHzCQBlRc-RXcyMggCF0glyRSXBtIWv1jtnoSQOMXw4Y4XWeiYdsX40MLGzKgbmLSLVBBdh2k2gdDRSTU1AxbejVCjlwMIylw5IecADdJwgib6XIQfCgapx1To7au-SY-Ds5J_X_ldQ5fBC5gv715UmgGeRzVxFB4AKXU9meMtEEg1Jz0Ij9eAUIE2SqlgJwwRt-_7nHWENoiE63EMlM-m4RWq-DDI4yIum4GEb"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
                    <div className="absolute bottom-0 w-full p-4 bg-[#10221c] text-white text-xs font-bold uppercase tracking-widest">
                        Our Story
                    </div>
                </div>
                <div className="group relative h-64 overflow-hidden border-r border-slate-200">
                    <img
                        alt="Active wear"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKMmZ6gaT21JmjWWG_C4ZkPthROBwJSI6f4OKMfAstzDf4cfEdm9bFARJRr4LHm6n88Es6Dy3ZnQiNlfNq_Qx1d4O6-Vz4zMNVYNQ5GZXTj9xbMBaTDxS1_8yT1zyMYoczxVypsH3z8ebUZBD45XkWxRb3sqmvZLmHYaWsUdrDkMjLSuQa9rHomosHdckBTW3R4mjvGMCaQyZhn7fJfNZk3ib36cfynARYxi1p63ha1_cvvkf6gGCeUQRkLZRXhmbeOsLNGGgimbhR"
                    />
                    <div className="absolute inset-0 bg-[#10221c]/20 group-hover:bg-[#10221c]/40 transition-colors" />
                    <div className="absolute bottom-0 w-full p-4 bg-[#10221c] text-white text-xs font-bold uppercase tracking-widest">
                        Sport Collection
                    </div>
                </div>
                <div className="group relative h-64 overflow-hidden">
                    <img
                        alt="Le Club perks"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrzrTKHakxmeXMvUeswNPD1DGEYOqZDq7whblCrVuW-LxOGaJEbvClTdcbX6Qz5VK7OIpnF-zfU9COleYROKxzUl9KkPfPzSDLTv7jjx1gQllf8VFlwybtR8WqnOuC2pIeHyFbogqvYnJJP03uDc83GDysGcySNhXcVLJlrz_sGwBQgT8T4C4ShmwA165xSVg49T6ILy2pBviBfv_E_fxaoxBgobMmgye6owAmQvi4Bi3ejItoVTdr32DlrZawdYBdav5iKdp5JCcY"
                    />
                    <div className="absolute inset-0 bg-yellow-500/20 group-hover:bg-yellow-500/40 transition-colors" />
                    <div className="absolute bottom-0 w-full p-4 bg-[#10221c] text-white text-xs font-bold uppercase tracking-widest">
                        Member Exclusives
                    </div>
                </div>
            </section>
            <section className="py-24 bg-white font-['Manrope']">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-serif italic mb-4 font-['Playfair_Display']">
                            Member Privileges
                        </h2>
                        <div className="w-20 h-1 bg-[#11d490] mx-auto mb-6" />
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            Every interaction brings you closer to exclusive experiences and
                            bespoke rewards crafted for our most loyal community.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors group-hover:bg-[#11d490] group-hover:text-[#10221c]">
                                <span className="material-symbols-outlined text-3xl">loyalty</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">
                                Earn Points
                            </h3>
                            <p className="text-slate-500">
                                Earn 10 points for every ₹100 spent. Redeem them for exclusive
                                vouchers or limited-edition gear.
                            </p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors group-hover:bg-[#11d490] group-hover:text-[#10221c]">
                                <span className="material-symbols-outlined text-3xl">
                                    event_available
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">
                                Early Access
                            </h3>
                            <p className="text-slate-500">
                                Shop seasonal sales and new collaborative collections 48 hours
                                before the public launch.
                            </p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors group-hover:bg-[#11d490] group-hover:text-[#10221c]">
                                <span className="material-symbols-outlined text-3xl">
                                    celebration
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">
                                Birthday Gift
                            </h3>
                            <p className="text-slate-500">
                                Celebrate with a personalized surprise and a special discount code
                                delivered on your day.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section
                className="py-24 bg-white overflow-hidden relative font-['Manrope']"
                id="join"
            >
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="bg-white shadow-2xl flex flex-wrap lg:flex-nowrap border border-slate-100">
                        <div className="w-full lg:w-1/2 p-12 lg:p-20">
                            <h2 className="text-3xl font-bold uppercase tracking-tighter mb-8 text-[#10221c]">
                                Join the Movement
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60 text-[#10221c]">
                                            First Name
                                        </label>
                                        <input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-slate-100 focus:ring-1 focus:ring-[#11d490] p-4 text-sm"
                                            placeholder="René"
                                            type="text"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60 text-[#10221c]">
                                            Last Name
                                        </label>
                                        <input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-slate-100 focus:ring-1 focus:ring-[#11d490] p-4 text-sm"
                                            placeholder="Lacoste"
                                            type="text"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60 text-[#10221c]">
                                        Email Address
                                    </label>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-slate-100 focus:ring-1 focus:ring-[#11d490] p-4 text-sm"
                                        placeholder="rene@elegance.com"
                                        type="email"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60 text-[#10221c]">
                                        Password
                                    </label>
                                    <input
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-slate-100 focus:ring-1 focus:ring-[#11d490] p-4 text-sm"
                                        placeholder="********"
                                        type="password"
                                        required
                                    />
                                </div>
                                <div className="flex items-start space-x-3">
                                    <input
                                        className="mt-1 text-[#10221c] focus:ring-[#11d490] rounded-none border-slate-300"
                                        type="checkbox"
                                        required
                                    />
                                    <span className="text-xs text-slate-500">
                                        I agree to the Terms &amp; Conditions and want to receive the
                                        membership newsletter with exclusive offers and news.
                                    </span>
                                </div>
                                <button
                                    className="w-full bg-[#10221c] text-white py-5 font-bold uppercase tracking-[0.2em] hover:bg-[#11d490] hover:text-[#10221c] transition-all"
                                    type="submit"
                                >
                                    Create My Account
                                </button>
                            </form>
                        </div>
                        <div className="w-full lg:w-1/2 relative min-h-[400px]">
                            <img
                                alt="Membership lifestyle"
                                className="absolute inset-0 w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkOoXNoCqrGj5zrQVEO5fb4NCMz05XVS-JAdROBpIZTdcK76D3aK-tDeNw59SuithV0lNSJOA-Lwi-ae8_iwWeeWXXpvxvkdaTCl9sc5BIrTaF5_YlwV5FEbHp6nOk9t5XPbnS0tAx7VgWXCIKsTpfJMzpa6mDjapHLQalI65mBBI2SNNhytEB7G-HCNaEpTrLJ4ECihhvHz6to1HblJocpM5I2oBu5lXfI8mDA9LwHAU18z1Yq8SUwS1AsAWzVY0Fq0AIORmtZX9a"
                            />
                            <div className="absolute inset-0 bg-[#10221c]/40 flex items-center justify-center p-12 text-center text-white backdrop-blur-[2px]">
                                <div>
                                    <h4 className="text-4xl font-serif italic mb-4 font-['Playfair_Display']">
                                        "Winning is not enough if you don't play with style."
                                    </h4>
                                    <p className="text-sm font-bold uppercase tracking-[0.3em]">
                                        — RENÉ L'ELEGANCE
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </>
    );
};

export default Membership;
