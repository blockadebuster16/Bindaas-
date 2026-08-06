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

    const API_URL = 'http://localhost:5001/api/orders';

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
                    sort: sortBy
                }
            });
            setOrders(data);
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

    // Refetch when filters change (server-side filtering)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrders();
        }, 300); // debounce search
        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, statusFilter, sortBy]);

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
                                            <th scope="col" className="relative px-6 py-4 text-right"><span className="sr-only">Details</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">#{order._id.substring(order._id.length - 6)}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{order.products.length} items</div>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button 
                                                        onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
                                                    >
                                                        View Details
                                                    </button>
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
                                        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Order #{selectedOrder._id.substring(selectedOrder._id.length - 8)}</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-1">Placed on {new Date(selectedOrder.orderDate).toLocaleString()}</p>
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
                                                {selectedOrder.products.map((item, idx) => (
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
