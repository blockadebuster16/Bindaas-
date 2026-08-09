import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

const PageLayoutManager = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedPage, setSelectedPage] = useState('home');
    const [layout, setLayout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Modals & New Section State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSection, setNewSection] = useState({
        type: 'ad_break',
        title: 'New Editorial Break',
        categoryFilter: '',
        redirectUrl: '',
        adId: '',
        enabled: true
    });
    const [ads, setAds] = useState([]);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/advertisements/admin`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAds(res.data);
            } catch (err) {
                console.error("Failed to load ads", err);
            }
        };
        fetchAds();
    }, []);

    const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/page-layouts`;

    const pages = [
        { key: 'home', label: 'Home Page' },
        { key: 'men', label: 'Men\'s Page' },
        { key: 'women', label: 'Women\'s Page' },
        { key: 'apparel', label: 'Apparel Page' },
        { key: 'sports', label: 'Sports Page' },
        { key: 'classics', label: 'Classics Page' }
    ];

    const sectionTypes = [
        { type: 'hero_ad', label: 'Hero Ad Banner', desc: 'Top full-screen video/image hero ad' },
        { type: 'split_ad', label: 'Split Banner Ad', desc: 'Dual left/right split promotional banner' },
        { type: 'ad_strip', label: 'Carousel Ad Strip', desc: 'Horizontal scrolling promotion strip' },
        { type: 'ad_break', label: 'Content Break Ad / Editorial Banner', desc: 'Full-bleed image/video break banner between grids' },
        { type: 'ad_middle', label: 'Middle Advertisement Banner', desc: 'Category or middle promotional banner' },
        { type: 'product_grid', label: 'Product Collection Grid', desc: 'Dynamic product grid section' },
        { type: 'recently_viewed', label: 'Recently Viewed Footprint', desc: 'User recent items section' },
        { type: 'feature_showcase', label: 'Feature Showcase Ad', desc: 'Dual-column editorial story & media showcase banner' },
        { type: 'heritage', label: 'Brand Heritage Story', desc: 'Heritage story layout' }
    ];

    const fetchLayout = async (pageKey) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE}/${pageKey}`);
            setLayout(data);
        } catch (err) {
            showToast("Failed to load page layout", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLayout(selectedPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPage]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleSaveLayout = async () => {
        if (!layout) return;
        try {
            setSaving(true);
            await axios.put(`${API_BASE}/${selectedPage}`, {
                sections: layout.sections,
                title: layout.title
            });
            showToast("Page layout updated successfully!");
        } catch (err) {
            showToast("Failed to save layout changes", "error");
        } finally {
            setSaving(false);
        }
    };

    const moveSection = (index, direction) => {
        if (!layout) return;
        const newSections = [...layout.sections];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newSections.length) return;

        const temp = newSections[index];
        newSections[index] = newSections[targetIndex];
        newSections[targetIndex] = temp;

        // Re-assign order index
        newSections.forEach((sec, idx) => sec.order = idx + 1);

        setLayout({ ...layout, sections: newSections });
    };

    const toggleSection = (index) => {
        if (!layout) return;
        const newSections = [...layout.sections];
        newSections[index].enabled = !newSections[index].enabled;
        setLayout({ ...layout, sections: newSections });
    };

    const deleteSection = (index) => {
        if (!layout) return;
        const newSections = layout.sections.filter((_, idx) => idx !== index);
        setLayout({ ...layout, sections: newSections });
    };

    const handleAddSection = () => {
        if (!layout) return;
        const sectionId = `sec-${selectedPage}-${Date.now()}`;
        const added = {
            id: sectionId,
            type: newSection.type,
            title: newSection.title || 'New Section',
            categoryFilter: newSection.categoryFilter || '',
            redirectUrl: newSection.redirectUrl || '',
            order: layout.sections.length + 1,
            enabled: newSection.enabled
        };

        if (newSection.adId) {
            added.adId = newSection.adId;
        }

        setLayout({ ...layout, sections: [...layout.sections, added] });
        setIsAddModalOpen(false);
        setNewSection({ type: 'ad_break', title: 'New Editorial Break', categoryFilter: '', redirectUrl: '', adId: '', enabled: true });
        showToast("Section added to layout!");
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-display overflow-hidden">
            
            {/* Toast */}
            {toast.show && (
                <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center gap-3 transform transition-all duration-300 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            )}

            {/* Admin Sidebar */}
            <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Page Content & Layout Manager</h1>
                            <p className="text-sm text-gray-500 mt-1">View active storefront pages, add break ads, and arrange live sections in sequence.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-bindas-onyx hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
                            >
                                <span className="material-icons-outlined text-sm">add</span>
                                Add Section / Ad
                            </button>
                            <button
                                onClick={handleSaveLayout}
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <span className="material-icons-outlined text-sm">save</span>
                                {saving ? 'Saving...' : 'Save Page Layout'}
                            </button>
                        </div>
                    </div>

                    {/* Page Selector Tabs */}
                    <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-4 mb-8">
                        {pages.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setSelectedPage(key)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                    selectedPage === key
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Layout Section Visual Wireframe */}
                    {loading ? (
                        <div className="flex justify-center flex-col items-center h-64 text-gray-500">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
                            <p className="text-sm font-medium">Loading page wireframe...</p>
                        </div>
                    ) : !layout || layout.sections.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                            <p className="text-gray-400 font-bold uppercase text-xs">No sections configured for this page.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 px-2">
                                <span>Live Page Sequence (Top to Bottom)</span>
                                <span>{layout.sections.length} Active Content Blocks</span>
                            </div>

                            {layout.sections.map((sec, idx) => (
                                <div
                                    key={sec.id || idx}
                                    className={`bg-white p-5 rounded-2xl border transition-all shadow-sm flex items-center justify-between gap-4 ${
                                        sec.enabled ? 'border-gray-200 hover:border-gray-400' : 'border-gray-100 opacity-50 bg-gray-50'
                                    }`}
                                >
                                    {/* Number / Order Badge */}
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-extrabold flex items-center justify-center">
                                            {idx + 1}
                                        </span>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900 text-sm">{sec.title}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                    sec.type === 'ad_break' ? 'bg-amber-100 text-amber-800' :
                                                    sec.type === 'hero_ad' ? 'bg-purple-100 text-purple-800' :
                                                    sec.type === 'product_grid' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {sec.type}
                                                </span>
                                            </div>
                                            {sec.categoryFilter && (
                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Filter: {sec.categoryFilter}</p>
                                            )}
                                            {sec.redirectUrl && (
                                                <p className="text-[10px] text-emerald-600 font-mono mt-0.5">Redirect: {sec.redirectUrl}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Controls */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => moveSection(idx, -1)}
                                            disabled={idx === 0}
                                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30"
                                            title="Move Section Up"
                                        >
                                            <span className="material-icons-outlined text-base">arrow_upward</span>
                                        </button>
                                        <button
                                            onClick={() => moveSection(idx, 1)}
                                            disabled={idx === layout.sections.length - 1}
                                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30"
                                            title="Move Section Down"
                                        >
                                            <span className="material-icons-outlined text-base">arrow_downward</span>
                                        </button>
                                        <button
                                            onClick={() => toggleSection(idx)}
                                            className={`p-2 rounded-lg font-bold text-xs flex items-center gap-1 ${
                                                sec.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            <span className="material-icons-outlined text-base">{sec.enabled ? 'visibility' : 'visibility_off'}</span>
                                            {sec.enabled ? 'Enabled' : 'Hidden'}
                                        </button>
                                        <button
                                            onClick={() => deleteSection(idx)}
                                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                            title="Remove Section"
                                        >
                                            <span className="material-icons-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </main>

            {/* Add Section Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-lg font-extrabold uppercase tracking-tight text-bindas-onyx">Add Section / Ad to Page</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 hover:text-black">
                                âœ•
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Section Title</label>
                                <input
                                    type="text"
                                    value={newSection.title}
                                    onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                                    placeholder="e.g. Womenswear Editorial Break"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:ring-1 focus:ring-black outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Section Type</label>
                                <select
                                    value={newSection.type}
                                    onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none"
                                >
                                    {sectionTypes.map(st => (
                                        <option key={st.type} value={st.type}>{st.label}</option>
                                    ))}
                                </select>
                            </div>

                            {newSection.type === 'product_grid' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Category Filter Key</label>
                                        <input
                                            type="text"
                                            value={newSection.categoryFilter}
                                            onChange={(e) => setNewSection({ ...newSection, categoryFilter: e.target.value })}
                                            placeholder="e.g. new_arrivals, womens_collection"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:ring-1 focus:ring-black outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Redirect Link / Discover More Link</label>
                                        <input
                                            type="text"
                                            value={newSection.redirectUrl}
                                            onChange={(e) => setNewSection({ ...newSection, redirectUrl: e.target.value })}
                                            placeholder="e.g. /shop, /women, /men, /apparel"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:ring-1 focus:ring-black outline-none"
                                        />
                                    </div>
                                </>
                            )}

                            {newSection.type !== 'product_grid' && newSection.type !== 'recently_viewed' && (
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Select Advertisement (Optional)</label>
                                    <select
                                        value={newSection.adId}
                                        onChange={(e) => setNewSection({ ...newSection, adId: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none"
                                    >
                                        <option value="">-- Auto-select first available --</option>
                                        {ads.filter(ad => {
                                            const typeMap = {
                                                'hero_ad': 'hero',
                                                'split_ad': 'split',
                                                'ad_strip': 'strip',
                                                'ad_break': 'break',
                                                'ad_middle': 'middle',
                                                'feature_showcase': 'feature_showcase',
                                                'heritage': 'heritage'
                                            };
                                            return ad.bannerType === typeMap[newSection.type];
                                        }).map(ad => (
                                            <option key={ad._id} value={ad._id}>{ad.title} ({ad.bannerType})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handleAddSection} className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black shadow-md">
                                Add Section
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageLayoutManager;


