import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // UI & Filter State
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [syncingId, setSyncingId] = useState(null);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/orders`;

    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminToken');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(API_URL, {
                ...getAuthHeaders(),
                params: {
                    search: searchTerm,
                    status: statusFilter,
                    sort: sortBy,
                    paginated: 'true',
                    page: currentPage,
                    limit: 20
                }
            });
            if (data.orders) {
                setOrders(data.orders);
                setTotalPages(data.totalPages);
                setTotalItems(data.totalItems);
            } else {
                setOrders(data);
            }
            setError(null);
        } catch (err) {
            setError("Failed to fetch orders.");
            if (err.response?.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin-login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Refetch when filters or page change (server-side filtering)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrders();
        }, 300); // debounce search
        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, statusFilter, sortBy, currentPage]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };


    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`${API_URL}/${orderId}/status`, { status: newStatus }, getAuthHeaders());
            
            // Update local state without refetching everything
            setOrders(prevOrders => prevOrders.map(order => 
                order._id === orderId ? { ...order, status: newStatus } : order
            ));
            
            showToast(`Order status updated to ${newStatus}`);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    // Trigger live Qikink tracking sync for an order
    const handleSyncQikink = async (orderId) => {
        setSyncingId(orderId);
        try {
            const { data } = await axios.post(
                `${API_URL}/${orderId}/sync-qikink`,
                {},
                getAuthHeaders()
            );
            // Merge updated tracking fields back into local state
            const updated = data.order || {};
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...updated } : o));
            // Also update the open modal if it's the same order
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder(prev => ({ ...prev, ...updated }));
            }
            showToast('Qikink tracking synced successfully');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to sync Qikink status', 'error');
        } finally {
            setSyncingId(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getFulfillmentStyle = (status) => {
        switch (status) {
            case 'SUBMITTED': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'IN_PRODUCTION': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'SHIPPED': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'FAILED': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-display overflow-hidden">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center gap-3 transform transition-all duration-300 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
                    {toast.type === 'success' ? (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    )}
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            )}

            {/* Sidebar */}
            <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Order Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Track fulfillments and trigger downstream automations.</p>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                             <input
                                type="text"
                                placeholder="Search by customer email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 placeholder-gray-400"
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="block w-full md:w-48 pl-3 pr-10 py-2 text-sm bg-gray-50 border-gray-200 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                            </select>

                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="block w-full md:w-48 pl-3 pr-10 py-2 text-sm bg-gray-50 border-gray-200 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0"><svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></div>
                                <div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div>
                            </div>
                        </div>
                    )}

                    {/* Table Container */}
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center flex-col items-center h-64 text-gray-500">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                                <p className="text-sm font-medium">Loading orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                <h3 className="text-lg font-medium text-gray-900 px-2">No orders found</h3>
                                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Try adjusting your search or filter parameters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Info</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fulfillment</th>
                                            <th scope="col" className="relative px-6 py-4 text-right"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">#{String(order._id).substring(String(order._id).length - 6)}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{(order.products || []).length} items</div>
                                                    {order.ticketId && (
                                                        <div className="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-[100px]" title={order.ticketId}>
                                                            🎫 {order.ticketId.substring(0, 8)}…
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{order.userEmail}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.orderDate).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                        <select 
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                            className="block w-32 py-1 px-2 text-xs bg-white border-gray-200 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm ml-2"
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Processing">Processing</option>
                                                            <option value="Shipped">Shipped</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                {/* Fulfillment Status Column */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {order.fulfillmentStatus ? (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getFulfillmentStyle(order.fulfillmentStatus)}`}>
                                                            {order.fulfillmentStatus}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400 font-medium">Not submitted</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Qikink Sync Button */}
                                                        {order.qikinkOrderId && (
                                                            <button
                                                                onClick={() => handleSyncQikink(order._id)}
                                                                disabled={syncingId === order._id}
                                                                className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-900 bg-violet-50 px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Sync live tracking from Qikink"
                                                            >
                                                                {syncingId === order._id ? (
                                                                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                    </svg>
                                                                )}
                                                                Sync
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                                                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
             </main>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-8 pt-8 pb-10">
                                <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Order #{String(selectedOrder._id).substring(String(selectedOrder._id).length - 8)}</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-1">Placed on {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                                        {selectedOrder.ticketId && (
                                            <p className="text-[9px] font-mono text-slate-400 mt-1">🎫 Ticket: {selectedOrder.ticketId}</p>
                                        )}
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <span className="material-icons">close</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                                    {/* Customer Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Customer Information</h4>
                                            <p className="text-sm font-bold text-gray-900">{selectedOrder.fullName || 'Anonymous'}</p>
                                            <p className="text-sm text-gray-600">{selectedOrder.userEmail}</p>
                                            <p className="text-sm text-gray-600">{selectedOrder.phone}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Shipping Destination</h4>
                                            <p className="text-sm text-gray-900 leading-relaxed">
                                                {selectedOrder.shippingAddress?.addressLine1}<br />
                                                {selectedOrder.shippingAddress?.addressLine2 && <>{selectedOrder.shippingAddress?.addressLine2}<br /></>}
                                                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br />
                                                {selectedOrder.shippingAddress?.postalCode}, {selectedOrder.shippingAddress?.country}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Financial Info */}
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Financial Summary</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 font-medium">Payment ID</span>
                                                <span className="text-gray-900 font-bold">{selectedOrder.razorpayPaymentId || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm border-t border-slate-200 pt-3 mt-3">
                                                <span className="text-gray-900 font-bold uppercase tracking-widest text-[10px]">Total Amount</span>
                                                <span className="text-indigo-600 font-black text-lg">{formatCurrency(selectedOrder.totalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Qikink Fulfillment Tracking Panel ── */}
                                <div className="mb-10 p-5 rounded-xl border border-violet-100 bg-violet-50/40">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                                </svg>
                                            </div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-700">Qikink POD Fulfillment</h4>
                                        </div>
                                        {selectedOrder.qikinkOrderId && (
                                            <button
                                                onClick={() => handleSyncQikink(selectedOrder._id)}
                                                disabled={syncingId === selectedOrder._id}
                                                className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-violet-700 bg-violet-100 hover:bg-violet-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {syncingId === selectedOrder._id ? (
                                                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                    </svg>
                                                ) : (
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                )}
                                                Sync Live Status
                                            </button>
                                        )}
                                    </div>

                                    {selectedOrder.qikinkOrderId ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div className="bg-white rounded-lg p-3 border border-violet-100">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Qikink Order ID</p>
                                                <p className="text-xs font-bold text-gray-800 break-all">{selectedOrder.qikinkOrderId}</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 border border-violet-100">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Fulfillment Status</p>
                                                {selectedOrder.fulfillmentStatus ? (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getFulfillmentStyle(selectedOrder.fulfillmentStatus)}`}>
                                                        {selectedOrder.fulfillmentStatus}
                                                    </span>
                                                ) : <p className="text-xs text-gray-500">—</p>}
                                            </div>
                                            <div className="bg-white rounded-lg p-3 border border-violet-100">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Courier</p>
                                                <p className="text-xs font-bold text-gray-800">{selectedOrder.courierName || '—'}</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 border border-violet-100">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">AWB / Tracking No.</p>
                                                <p className="text-xs font-bold text-gray-800 break-all">{selectedOrder.trackingNumber || '—'}</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 border border-violet-100 sm:col-span-2">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Tracking URL</p>
                                                {selectedOrder.trackingUrl ? (
                                                    <a
                                                        href={selectedOrder.trackingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-bold text-violet-600 hover:text-violet-800 underline break-all"
                                                    >
                                                        {selectedOrder.trackingUrl}
                                                    </a>
                                                ) : <p className="text-xs text-gray-500">Available after dispatch</p>}
                                            </div>
                                            {selectedOrder.qikinkSyncedAt && (
                                                <div className="sm:col-span-3 text-right">
                                                    <p className="text-[8px] text-slate-400 font-medium">
                                                        Last synced: {new Date(selectedOrder.qikinkSyncedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                Qikink order not yet submitted. It will be dispatched automatically after payment verification.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Product Breakdown */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Itemized Acquisition</h4>
                                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-[9px] font-black uppercase tracking-widest text-gray-500">Piece</th>
                                                    <th className="px-6 py-3 text-left text-[9px] font-black uppercase tracking-widest text-gray-500">Variant</th>
                                                    <th className="px-6 py-3 text-center text-[9px] font-black uppercase tracking-widest text-gray-500">Qty</th>
                                                    <th className="px-6 py-3 text-right text-[9px] font-black uppercase tracking-widest text-gray-500">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {(selectedOrder.products || []).map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-6 py-4 flex items-center gap-3">
                                                            <div className="w-10 h-12 bg-slate-100 rounded overflow-hidden">
                                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">{item.name}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Size: {item.size}</span>
                                                                {item.color && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color: {item.color}</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-xs font-bold">{item.quantity}</td>
                                                        <td className="px-6 py-4 text-right text-xs font-bold">{formatCurrency(item.price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-8 py-4 flex justify-end">
                                <button onClick={() => setIsModalOpen(false)} className="bg-gray-900 text-white px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg">Close Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersManagement;
