import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OutreachDashboard = () => {
    const [stats, setStats] = useState({ sent: 0, opened: 0, clicked: 0, bounced: 0 });
    const [campaigns, setCampaigns] = useState([]);
    const [segments, setSegments] = useState([]);
    
    // For creating new segment
    const [newSegmentName, setNewSegmentName] = useState('');
    const [newSegmentRules, setNewSegmentRules] = useState('');

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [analyticsRes, campaignsRes, segmentsRes] = await Promise.allSettled([
                axios.get('/api/outreach/analytics', config),
                axios.get('/api/outreach/campaigns', config),
                axios.get('/api/outreach/segments', config)
            ]);
            
            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data) {
                setStats(analyticsRes.value.data);
            }
            if (campaignsRes.status === 'fulfilled' && Array.isArray(campaignsRes.value.data)) {
                setCampaigns(campaignsRes.value.data);
            }
            if (segmentsRes.status === 'fulfilled' && Array.isArray(segmentsRes.value.data)) {
                setSegments(segmentsRes.value.data);
            }
        } catch (error) {
            console.error("Failed to fetch outreach data", error);
        }
    };

    const handleCreateSegment = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/outreach/segments', {
                name: newSegmentName,
                rules: JSON.parse(newSegmentRules)
            }, { headers: { Authorization: `Bearer ${token}` } });
            setNewSegmentName('');
            setNewSegmentRules('');
            fetchDashboardData();
        } catch (error) {
            alert('Failed to create segment. Ensure rules are valid JSON.');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Minimal sidebar placeholder if standard one fails */}
            <div className="w-64 bg-bindas-onyx text-white p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-8 text-bindas-amber">Outreach Engine</h2>
                <a href="/admin" className="mb-4 hover:text-bindas-amber">← Back to Admin</a>
                <a href="#analytics" className="mb-4 text-gray-300">Analytics</a>
                <a href="#campaigns" className="mb-4 text-gray-300">Campaigns</a>
                <a href="#segments" className="mb-4 text-gray-300">Segments</a>
            </div>

            <div className="flex-1 overflow-y-auto p-10 font-sans">
                <div className="max-w-6xl mx-auto space-y-12">
                    
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Segmentation & Outreach</h1>
                        <p className="text-gray-500 mt-2">Manage your RFM segments and cold email drip campaigns.</p>
                    </div>

                    {/* Analytics Overview */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100" id="analytics">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Real-time Analytics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 font-medium">Emails Sent</p>
                                <p className="text-3xl font-black text-blue-600 mt-1">{stats.sent || 0}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 font-medium">Opened</p>
                                <p className="text-3xl font-black text-green-600 mt-1">{stats.opened || 0}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 font-medium">Clicked</p>
                                <p className="text-3xl font-black text-purple-600 mt-1">{stats.clicked || 0}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 font-medium">Bounced</p>
                                <p className="text-3xl font-black text-red-600 mt-1">{stats.bounced || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Campaigns Table */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100" id="campaigns">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Active Campaigns</h2>
                            <button className="bg-bindas-onyx text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black">
                                + New Campaign
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Segment</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(campaigns || []).map(c => (
                                         <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                                             <td className="py-3 px-4 text-sm font-medium">{c.name}</td>
                                             <td className="py-3 px-4 text-sm text-gray-500">{c.segments?.name || 'N/A'}</td>
                                             <td className="py-3 px-4 text-sm">
                                                 <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">
                                                     {c.status}
                                                 </span>
                                             </td>
                                         </tr>
                                     ))}
                                     {(!campaigns || campaigns.length === 0) && (
                                         <tr><td colSpan="3" className="py-4 px-4 text-center text-gray-500">No campaigns found.</td></tr>
                                     )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Segments Builder */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100" id="segments">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Custom Segments</h2>
                        
                        <form onSubmit={handleCreateSegment} className="mb-8 p-6 bg-gray-50 rounded-xl space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Segment Name</label>
                                <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-bindas-amber outline-none" value={newSegmentName} onChange={(e) => setNewSegmentName(e.target.value)} placeholder="e.g., At-Risk Big Spenders" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Rules (JSON format)</label>
                                <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-bindas-amber outline-none font-mono text-sm" rows="3" value={newSegmentRules} onChange={(e) => setNewSegmentRules(e.target.value)} placeholder='{ "rfm_segment": "At Risk", "total_spent": { ">": 1000 } }' required />
                            </div>
                            <button type="submit" className="bg-bindas-amber text-bindas-onyx px-6 py-2 rounded-lg font-bold hover:bg-yellow-400">
                                Create Segment
                            </button>
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(segments || []).map(s => (
                                <div key={s.id} className="border border-gray-200 p-4 rounded-xl">
                                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto text-gray-600">
                                        {JSON.stringify(s.rules, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OutreachDashboard;
