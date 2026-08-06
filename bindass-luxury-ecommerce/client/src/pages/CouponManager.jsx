import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [hideExpired, setHideExpired] = useState(false);

  // UI State
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    expiryDate: ''
  });

  const API_URL = 'http://localhost:5001/api/coupons';

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(data);
    } catch (err) {
      setError("Failed to fetch coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase || 0)
      };

      await axios.post(API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast('Coupon created successfully');
      setFormData({ code: '', discountType: 'percentage', discountValue: '', minPurchase: '', expiryDate: '' });
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create coupon', 'error');
    }
  };

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${API_URL}/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCoupons();
      showToast('Status updated');
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coupon permanently?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Coupon deleted');
        fetchCoupons();
      } catch (err) {
        showToast('Failed to delete coupon', 'error');
      }
    }
  };


  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-display overflow-hidden">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center gap-3 transform transition-all duration-300 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 01(1.414) 0z" clipRule="evenodd" /></svg>
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
            
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900 leading-tight">Coupon Management</h1>
               <p className="text-sm text-gray-500 mt-1">Create and manage store-wide discount codes.</p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  New Coupon
               </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <button 
                  onClick={() => setHideExpired(!hideExpired)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${hideExpired ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {hideExpired ? 'Showing Active Only' : 'Showing All Coupons'}
                </button>
             </div>
             <div className="text-xs text-gray-500 font-medium">
                {coupons.filter(c => hideExpired ? !(c.expiryDate && new Date(c.expiryDate) < new Date()) : true).length} Coupons Total
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
                   <p className="text-sm font-medium">Loading coupons...</p>
                </div>
             ) : coupons.length === 0 ? (
                <div className="text-center py-16 px-4">
                   <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 11h.01M7 15h.01M10 7h10M10 11h10M10 15h10M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>
                   <h3 className="text-lg font-medium text-gray-900 px-2">No coupons found</h3>
                   <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Get started by creating a new luxury promo code.</p>
                </div>
             ) : (
                <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200">
                       <thead className="bg-gray-50">
                        <tr>
                           <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Promo Code</th>
                           <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                           <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Min. Spend</th>
                           <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry</th>
                           <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                           <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                         {coupons
                           .filter(coupon => {
                             if (!hideExpired) return true;
                             const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                             return !isExpired;
                           })
                           .map((coupon) => {
                             const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                             return (
                           <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span className="font-mono bg-gray-100 px-3 py-1.5 rounded-lg text-gray-900 font-bold text-sm tracking-wider border border-gray-200">
                                   {coupon.code}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm font-semibold text-gray-900">
                                   {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                 ₹{coupon.minPurchase?.toLocaleString() || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                 {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 {isExpired ? (
                                   <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
                                     <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-gray-400"></span>
                                     Expired
                                   </div>
                                 ) : (
                                   <button 
                                     onClick={() => toggleStatus(coupon._id)}
                                     className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                                       coupon.isActive 
                                         ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' 
                                         : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                                     }`}
                                   >
                                     <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${coupon.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                     {coupon.isActive ? 'Active' : 'Disabled'}
                                   </button>
                                 )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                 <button 
                                   onClick={() => handleDelete(coupon._id)}
                                   className="p-1.5 text-gray-400 hover:text-red-600 bg-white hover:bg-gray-50 rounded-md border border-gray-200 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                 >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                 </button>
                              </td>
                           </tr>
                             );
                          })}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        </div>
      </main>

      {/* Slide-over Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-2xl flex">
              <div className="w-screen max-w-md">
                <div className="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-2xl rounded-l-2xl">
                                    <div className="flex-1 h-0 overflow-y-auto bg-white">
                    <div className="py-6 px-4 sm:px-6 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">New Promo Code</h2>
                        <button onClick={() => setIsModalOpen(false)} className="bg-transparent rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500">Configure parameters for a new luxury store-wide discount.</p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="px-4 divide-y divide-gray-200 sm:px-6">
                        <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6 pt-6 pb-5">
                          <div>
                             <label className="block text-sm font-semibold text-gray-900 mb-1">Coupon Code <span className="text-red-500">*</span></label>
                             <input type="text" name="code" required value={formData.code} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border font-mono uppercase tracking-wider" placeholder="LIFESTYLE20" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-semibold text-gray-900 mb-1">Discount Type</label>
                               <select name="discountType" value={formData.discountType} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border">
                                  <option value="percentage">Percentage (%)</option>
                                  <option value="fixed">Fixed Amount (₹)</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-sm font-semibold text-gray-900 mb-1">Value <span className="text-red-500">*</span></label>
                               <input type="number" name="discountValue" required min="1" value={formData.discountValue} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border" placeholder="e.g. 20" />
                            </div>
                          </div>

                          <div>
                             <label className="block text-sm font-semibold text-gray-900 mb-1">Minimum Purchase Requirement</label>
                             <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 sm:text-sm">₹</div>
                                <input type="number" name="minPurchase" min="0" value={formData.minPurchase} onChange={handleInputChange} className="block w-full pl-7 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border" placeholder="0" />
                             </div>
                          </div>

                          <div>
                             <label className="block text-sm font-semibold text-gray-900 mb-1">Expiry Date</label>
                             <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border" />
                             <p className="mt-2 text-xs text-gray-500 italic">Leave blank for no expiration.</p>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                                    <div className="flex-shrink-0 px-4 py-4 flex justify-end bg-gray-50 border-t border-gray-100">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mr-3">
                      Cancel
                    </button>
                    <button type="submit" form="coupon-form" className="py-2 px-8 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-black transition-all">
                      Create Coupon
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
