import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

const FormSubmissions = () => {
    const [tab, setTab] = useState('messages'); // 'messages' | 'subscribers'
    const [messages, setMessages] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const API_URL = 'http://localhost:5001/api/forms';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const headers = { headers: { Authorization: `Bearer ${token}` } };
                
                // Assuming we add these GET routes to the backend
                const msgRes = await axios.get(`${API_URL}/contact`, headers);
                const subRes = await axios.get(`${API_URL}/subscribe`, headers);
                
                setMessages(msgRes.data);
                setSubscribers(subRes.data);
            } catch (err) {
                console.error("Failed to fetch form data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-display overflow-hidden">
            <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <main className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Inquiries & Leads</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage contact messages and newsletter subscribers.</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-8">
                        <button 
                            onClick={() => setTab('messages')}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${tab === 'messages' ? 'border-[#10221c] text-[#10221c]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Messages ({messages.length})
                        </button>
                        <button 
                            onClick={() => setTab('subscribers')}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${tab === 'subscribers' ? 'border-[#10221c] text-[#10221c]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Subscribers ({subscribers.length})
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Leads...</div>
                        ) : tab === 'messages' ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Subject/Message</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {messages.length === 0 ? (
                                            <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">No messages found</td></tr>
                                        ) : messages.map((msg) => (
                                            <tr key={msg._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-gray-900">{msg.name}</p>
                                                    <p className="text-xs text-gray-500">{msg.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-gray-800 mb-1">{msg.subject || 'No Subject'}</p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">{msg.message}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                    {new Date(msg.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${msg.status === 'new' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-600'}`}>
                                                        {msg.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-500">Date Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {subscribers.length === 0 ? (
                                            <tr><td colSpan="2" className="px-6 py-10 text-center text-gray-400 italic">No subscribers found</td></tr>
                                        ) : subscribers.map((sub) => (
                                            <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{sub.email}</td>
                                                <td className="px-6 py-4 text-xs text-gray-500">
                                                    {new Date(sub.subscribedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FormSubmissions;
