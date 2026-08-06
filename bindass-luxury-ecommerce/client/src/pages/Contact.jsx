import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Contact = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'Inquiry', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', message: '' });
        try {
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/forms/contact`, formData);
            setStatus({ type: 'success', message: 'Your message has been sent to the BiNDAAS! concierge.' });
            setFormData({ name: '', email: '', subject: 'Inquiry', message: '' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to send message.' });
        } finally {
            setSubmitting(false);
        }
    };

    const popularQuestions = [
        { id: 1, text: "Is there any support for Bulk Orders?" },
        { id: 2, text: "Can I change my order?" },
        { id: 3, text: "Can I cancel my order?" },
        { id: 4, text: "Where is my order?" },
        { id: 5, text: "What are your shipping speeds?" },
        { id: 6, text: "What if I'm not happy with my purchase?" },
        { id: 7, text: "Where are my designs saved?" },
        { id: 8, text: "What is a Vista account?" },
    ];

    return (
        <div className="bg-[#faf9f8] min-h-screen font-['Manrope'] pb-20">
            {/* Hero Section */}
            <div className="bg-white pt-32 pb-16 px-6 text-center border-b border-slate-100">
                <h1 className="text-4xl md:text-5xl font-black text-[#10221c] tracking-tighter uppercase mb-8">
                    Help is here.
                </h1>
                <div className="max-w-xl mx-auto relative group">
                    <input 
                        type="text" 
                        placeholder="Search for Articles"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-6 pr-14 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-[#10221c] transition-all text-sm font-medium"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#10221c] transition-colors">
                        <i className="material-icons">search</i>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#10221c]">
                    <i className="material-icons text-sm">inventory_2</i>
                    <span>Need help tracking an order?</span>
                    <Link to="/profile" className="underline hover:text-emerald-600 transition-colors">Find and track an order</Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-16">
                {/* Popular Questions Grid */}
                <section className="mb-20">
                    <h2 className="text-xl font-black text-[#10221c] uppercase tracking-tighter mb-8 px-2">
                        Popular Questions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {popularQuestions.map((q) => (
                            <button 
                                key={q.id}
                                className="group flex items-center justify-between bg-white p-6 rounded-xl border border-slate-100 hover:border-[#10221c] hover:shadow-xl hover:shadow-[#10221c]/5 transition-all duration-300 text-left"
                            >
                                <span className="text-sm font-bold text-slate-700 group-hover:text-[#10221c] transition-colors">
                                    {q.text}
                                </span>
                                <i className="material-icons text-slate-300 group-hover:text-[#10221c] transition-all">chevron_right</i>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Contact Us Section */}
                <section>
                    <h2 className="text-xl font-black text-[#10221c] uppercase tracking-tighter mb-8 px-2">
                        Contact Us
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Phone Support */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                            <div className="relative">
                                <div className="flex justify-between items-start mb-10">
                                    <h3 className="text-base font-black uppercase tracking-tight text-[#10221c]">Phone</h3>
                                    <span className="bg-[#10221c] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">Fastest</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black text-[#10221c] tracking-tight hover:underline cursor-pointer">02522-669393</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Mon. â€“ Sat. 10:00 AM â€“ 7:00 PM</p>
                                </div>
                            </div>
                        </div>

                        {/* Email Support / Contact Form */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group h-full">
                            <div className="relative">
                                <h3 className="text-base font-black uppercase tracking-tight text-[#10221c] mb-8">Concierge Inquiry</h3>
                                
                                {status.message ? (
                                    <div className={`p-6 rounded-xl border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                                        <p className="text-xs font-bold uppercase tracking-widest mb-4">{status.type === 'success' ? 'Message Sent' : 'Error'}</p>
                                        <p className="text-sm font-medium leading-relaxed mb-6">{status.message}</p>
                                        <button onClick={() => setStatus({type:'', message:''})} className="text-[10px] font-black uppercase tracking-[0.2em] underline">Send another message</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleContactSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input 
                                                type="text" 
                                                placeholder="Full Name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full h-12 px-4 rounded-lg border border-slate-200 text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-[#10221c] outline-none"
                                            />
                                            <input 
                                                type="email" 
                                                placeholder="Email Address"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full h-12 px-4 rounded-lg border border-slate-200 text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-[#10221c] outline-none"
                                            />
                                        </div>
                                        <textarea 
                                            placeholder="Your Message"
                                            required
                                            rows="4"
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            className="w-full p-4 rounded-lg border border-slate-200 text-xs font-medium focus:ring-1 focus:ring-[#10221c] outline-none resize-none"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-4 bg-[#10221c] text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {submitting ? 'Sending...' : 'Dispatch Message'}
                                            {!submitting && <i className="material-icons text-sm">send</i>}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Contact;


