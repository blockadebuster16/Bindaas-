import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();
    
    // State
    const [orders, setOrders] = useState([]);
    const [profile, setProfile] = useState({
        displayName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });
    const [activeTab, setActiveTab] = useState('acquisitions'); // acquisitions | settings
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch Profile and Orders in parallel
                const [profileRes, ordersRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/users/profile', { headers }),
                    axios.get('http://localhost:5001/api/orders/my-orders', { headers })
                ]);

                setProfile(profileRes.data);
                setOrders(ordersRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            const token = await user.getIdToken();
            const { data } = await axios.put('http://localhost:5001/api/users/profile', profile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(data);
            alert("Profile successfully updated.");
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update profile.");
        } finally {
            setSaveLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Processing': return 'text-amber-600 bg-amber-50 border-amber-100';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    };

    const getStatusStep = (status) => {
        const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        return steps.indexOf(status);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-['Work_Sans']">
                <div className="text-center">
                    <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-4">Identification Required</p>
                    <button onClick={() => navigate('/')} className="btn-pill">Go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fafafa] min-h-screen font-['Work_Sans']">
            <main className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    
                    {/* Sidebar / Profile Header */}
                    <aside className="lg:col-span-1 border-r border-slate-100 pr-8">
                        <div className="sticky top-28 space-y-8">
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#10221c] text-white font-bold text-2xl uppercase">
                                            {profile.displayName?.[0] || user.email?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-[#10221c] tracking-tight">{profile.displayName || "Value Member"}</h1>
                                    <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <button 
                                    onClick={() => setActiveTab('acquisitions')}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${activeTab === 'acquisitions' ? 'bg-[#10221c] text-white' : 'text-slate-400 hover:text-[#10221c] hover:bg-slate-50'}`}
                                >
                                    Acquisitions
                                </button>
                                <button 
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${activeTab === 'settings' ? 'bg-[#10221c] text-white' : 'text-slate-400 hover:text-[#10221c] hover:bg-slate-50'}`}
                                >
                                    Shipping Profile
                                </button>
                            </nav>

                            <button 
                                onClick={() => window.confirm("Terminate session?") && logOut()}
                                className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-all flex items-center gap-2"
                            >
                                <i className="material-icons text-sm">logout</i> Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <section className="lg:col-span-3 space-y-10">
                        
                        {activeTab === 'acquisitions' ? (
                            <>
                                <header className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-[#10221c] uppercase tracking-tighter">Acquisition Timeline</h2>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-1 bg-slate-100 rounded-full">
                                        Last 12 Months
                                    </span>
                                </header>

                                {loading ? (
                                    <div className="space-y-6">
                                        {[1, 2].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-lg" />)}
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-8 relative">
                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 -z-0" />
                                        {orders.map((order) => (
                                            <div key={order._id} className="relative z-10 pl-16 group">
                                                <div className={`absolute left-4 top-8 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-2 ${order.status === 'Delivered' ? 'ring-emerald-500 bg-emerald-500' : 'ring-slate-300 bg-white'}`} />
                                                <div className="bg-white border border-slate-100 rounded-lg p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ordered on {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                            <h3 className="text-xs font-black uppercase text-[#10221c]">Order #{order._id.slice(-8).toUpperCase()}</h3>
                                                        </div>
                                                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold border uppercase tracking-[0.2em] w-fit ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 mb-8">
                                                        {order.products.map((p, pIdx) => (
                                                            <div key={pIdx} className="group/item relative">
                                                                <div className="w-16 h-20 bg-slate-50 rounded overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover/item:-translate-y-1">
                                                                    <img src={p.productId?.images?.[0] || p.productId?.image || 'https://via.placeholder.com/100'} alt="p" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-[#10221c] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                    {p.quantity}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="relative h-1 bg-slate-100 rounded-full mb-8 overflow-hidden">
                                                        <div className="absolute inset-y-0 bg-emerald-500 transition-all duration-1000 ease-out font-medium" style={{ width: `${(getStatusStep(order.status) + 1) * 25}%` }} />
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                                        <span>Total Amount</span>
                                                        <span className="text-xl font-black text-[#10221c]">₹{order.totalAmount.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                                        <svg className="w-32 h-32 mx-auto mb-8 opacity-40 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        <h3 className="text-lg font-bold text-[#10221c] uppercase tracking-widest mb-2">No Acquisitions Yet</h3>
                                        <p className="text-slate-400 text-xs mb-8 font-medium">Your collection is waiting to be started.</p>
                                        <button onClick={() => navigate('/')} className="btn-pill">Browse Collection</button>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Shipping Profile Tab */
                            <div className="animate-fade-in-right">
                                <header className="mb-10">
                                    <h2 className="text-2xl font-black text-[#10221c] uppercase tracking-tighter">Shipping Profile</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Automate your acquisition experience</p>
                                </header>

                                <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-100 rounded-lg p-8 space-y-8 max-w-2xl shadow-sm">
                                    {/* Personal Info */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 border-b pb-2">Personal Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Luxury Moniker</label>
                                                <input 
                                                    type="text" 
                                                    value={profile.displayName || ''} 
                                                    onChange={e => setProfile({...profile, displayName: e.target.value})}
                                                    placeholder="Full Name"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 text-sm font-medium focus:ring-1 focus:ring-[#10221c] outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact Number</label>
                                                <input 
                                                    type="tel" 
                                                    value={profile.phoneNumber || ''} 
                                                    onChange={e => setProfile({...profile, phoneNumber: e.target.value})}
                                                    placeholder="+91 000 000 0000"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 text-sm font-medium focus:ring-1 focus:ring-[#10221c] outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Info */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 border-b pb-2">Primary Destination</h3>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Address 1</label>
                                                    <input 
                                                        type="text" 
                                                        value={profile.addressLine1 || ''} 
                                                        onChange={e => setProfile({...profile, addressLine1: e.target.value})}
                                                        placeholder="Building, Street, Area"
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 text-sm font-medium focus:ring-1 focus:ring-[#10221c] outline-none transition-all"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Address 2 (Optional)</label>
                                                    <input 
                                                        type="text" 
                                                        value={profile.addressLine2 || ''} 
                                                        onChange={e => setProfile({...profile, addressLine2: e.target.value})}
                                                        placeholder="Apartment, Suite, Unit"
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 text-sm font-medium focus:ring-1 focus:ring-[#10221c] outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">City</label>
                                                    <input 
                                                        type="text" 
                                                        value={profile.city || ''} 
                                                        onChange={e => setProfile({...profile, city: e.target.value})}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-1 focus:ring-[#10221c]"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">State</label>
                                                    <input 
                                                        type="text" 
                                                        value={profile.state || ''} 
                                                        onChange={e => setProfile({...profile, state: e.target.value})}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-1 focus:ring-[#10221c]"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Zip / Pincode</label>
                                                    <input 
                                                        type="text" 
                                                        value={profile.pincode || ''} 
                                                        onChange={e => setProfile({...profile, pincode: e.target.value})}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-1 focus:ring-[#10221c]"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={saveLoading}
                                        className="btn-pill w-full disabled:opacity-50"
                                    >
                                        {saveLoading ? 'Archiving Profile...' : 'Save Shipping Profile'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Profile;
