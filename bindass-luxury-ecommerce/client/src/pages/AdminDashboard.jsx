import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // UI State
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState(''); // 'price-asc', 'price-desc', 'stock-asc', 'stock-desc'

  // Form State for Adding/Editing
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    materials_care: '',
    materials_integrity: '',
    shipping_returns: '',
    pages: [],
    images: [],
    sizes: '',
    colors: '',
    fit: '',
    productType: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const API_URL = 'http://localhost:5001/api/products';

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  // Setup Axios with Token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // Filtering & Sorting Logic
    const filteredAndSortedProducts = useMemo(() => {
        let result = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 (product.category || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = (categoryFilter && categoryFilter !== 'All') ? product.category === categoryFilter : true;
            return matchesSearch && matchesCategory;
        });

        if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
        if (sortBy === 'stock-asc') result.sort((a, b) => a.stock_quantity - b.stock_quantity);
        if (sortBy === 'stock-desc') result.sort((a, b) => b.stock_quantity - a.stock_quantity);

        return result;
    }, [products, searchTerm, categoryFilter, sortBy]);

    const lowStockItems = useMemo(() => {
        return products.filter(p => p.stock_quantity < 5);
    }, [products]);

  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', description: '', price: '', category: '', stock: '', materials_care: '', materials_integrity: '', shipping_returns: '', pages: [], images: [], sizes: '', colors: '', fit: '', productType: '' });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setFormData({
      id: product._id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      stock: product.stock_quantity || 0,
      materials_care: product.materials_care || '',
      materials_integrity: product.materials_integrity || '',
      shipping_returns: product.shipping_returns || '',
      pages: product.pages || [],
      images: product.images || [],
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      fit: product.fit || '',
      productType: product.productType || '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/toggle`, {}, getAuthHeaders());
      showToast('Product status updated');
      fetchProducts();
    } catch (e) {
      showToast('Failed to update product status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
        showToast('Product deleted successfully');
        fetchProducts();
      } catch (e) {
        showToast('Failed to delete product or Unauthorized', 'error');
        if (e.response?.status === 401) handleLogout();
      }
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const data = new FormData();
    files.forEach(file => data.append('images', file));

    try {
      setIsUploading(true);
      const res = await axios.post('http://localhost:5001/api/upload', data, { ...getAuthHeaders(), headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' }});
      
      if (res.data.success) {
         setFormData(prev => ({ ...prev, images: [...prev.images, ...res.data.urls] }));
         showToast('Images uploaded successfully!');
      }
    } catch (err) {
      showToast('Image upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
      setFormData(prev => ({
          ...prev,
          images: prev.images.filter((_, idx) => idx !== indexToRemove)
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        stock_quantity: Number(formData.stock),
        materials_care: formData.materials_care,
        materials_integrity: formData.materials_integrity,
        shipping_returns: formData.shipping_returns,
        pages: formData.pages,
        images: formData.images,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
        fit: formData.fit,
        productType: formData.productType,
      };

      if (isEditing && formData.id) {
        await axios.put(`${API_URL}/${formData.id}`, payload, getAuthHeaders());
        showToast('Product updated successfully');
      } else {
        await axios.post(API_URL, payload, getAuthHeaders());
        showToast('Product added successfully');
      }
      resetForm();
      fetchProducts();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to save product', 'error');
      if (e.response?.status === 401) handleLogout();
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
            
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">Catalog Management</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage your luxury product inventory and visibility.</p>
              </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setIsEditing(false); setFormData({ name: '', description: '', price: '', category: '', stock: 0, images: [], isActive: true }); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            New Product
                        </button>
                    </div>
                </div>

                {/* Low Stock Alert */}
                {lowStockItems.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-lg">
                                <span className="material-icons text-amber-600">inventory_2</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-tight">Low Stock Warning</h3>
                                <p className="text-xs text-amber-700 font-medium">{lowStockItems.length} products have fewer than 5 units left.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setSortBy('stock-asc'); }}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            Review Stock
                        </button>
                    </div>
                )}

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
                <input
                 type="text"
                 placeholder="Search products..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 placeholder-gray-400"
               />
            </div>
            
            <div className="flex gap-4">
               <select 
                 value={categoryFilter} 
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="block w-full md:w-48 pl-3 pr-10 py-2 text-sm bg-gray-50 border-gray-200 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
               >
                 <option value="All">All Categories</option>
                 <option value="Clothing">Clothing</option>
                 <option value="Accessories">Accessories</option>
                 <option value="Footwear">Footwear</option>
               </select>

               <select 
                 value={sortBy} 
                 onChange={(e) => setSortBy(e.target.value)}
                 className="block w-full md:w-48 pl-3 pr-10 py-2 text-sm bg-gray-50 border-gray-200 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
               >
                 <option value="newest">Newest First</option>
                 <option value="price-low">Price: Low to High</option>
                 <option value="price-high">Price: High to Low</option>
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
                   <p className="text-sm font-medium">Loading inventory...</p>
                </div>
             ) : filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-16 px-4">
                   <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                   <h3 className="text-lg font-medium text-gray-900 px-2">No products found</h3>
                   <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Get started by creating a new product or adjust your search filters.</p>
                </div>
             ) : (
                <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                         {filteredAndSortedProducts.map((product) => (
                             <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                                 <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="flex items-center">
                                         <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                             {product.images?.[0] ? (
                                                 <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                                             ) : (
                                                 <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                 </div>
                                             )}
                                         </div>
                                         <div className="ml-4">
                                             <div className="text-sm font-bold text-gray-900">{product.name}</div>
                                             <div className="text-xs text-gray-500 mt-0.5">ID: {product._id.substring(product._id.length - 6).toUpperCase()}</div>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                     <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                         {product.category}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                     {formatCurrency(product.price)}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                     <div className={`text-sm font-medium ${product.stock_quantity < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                                         {product.stock_quantity} units
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                     <button 
                                         onClick={() => handleToggleActive(product._id)}
                                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                                             product.isActive 
                                                 ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' 
                                                 : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                                         }`}
                                     >
                                         <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                         {product.isActive ? 'Active' : 'Disabled'}
                                     </button>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                     <div className="flex justify-end gap-2">
                                         <button 
                                             onClick={() => handleEditClick(product)}
                                             className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 rounded-md border border-gray-200 shadow-sm transition-all"
                                         >
                                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                         </button>
                                         <button 
                                             onClick={() => handleDelete(product._id)}
                                             className="p-1.5 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-md border border-gray-200 shadow-sm transition-all"
                                         >
                                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                         </button>
                                     </div>
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

      {/* Slide-over Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetForm}></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-2xl flex">
              <div className="w-screen max-w-md">
                <div className="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-2xl rounded-l-2xl">
                                    <div className="flex-1 h-0 overflow-y-auto bg-white">
                    <div className="py-6 px-4 sm:px-6 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                          {isEditing ? 'Edit Product details' : 'Create new product'}
                        </h2>
                        <button onClick={resetForm} className="bg-transparent rounded-md text-gray-400 hover:text-gray-600 focus:outline-none">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500">
                          {isEditing ? 'Update the details for this item.' : 'Fill in the information below to add a new item to the catalog.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="px-4 divide-y divide-gray-200 sm:px-6">
                        <form id="product-form" onSubmit={handleSubmit} className="space-y-5 pt-6 pb-5">
                          <div>
                             <label className="block text-sm font-medium text-gray-900 mb-1">Product Name <span className="text-red-500">*</span></label>
                             <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="e.g. Rolex Submariner" />
                          </div>
                          
                          <div>
                             <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                             <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="Product details..." />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-900 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                               <div className="relative rounded-md shadow-sm">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                     <span className="text-gray-500 sm:text-sm">₹</span>
                                  </div>
                                  <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleInputChange} className="block w-full pl-7 border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="0.00" />
                               </div>
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-900 mb-1">Inventory</label>
                               <input type="number" name="stock" min="0" value={formData.stock} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="0" />
                            </div>
                          </div>

                          <div>
                             <label className="block text-sm font-medium text-gray-900 mb-1">Category (Primary)</label>
                             <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="e.g. Watches, Accessories" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">Product Type (Variant Cat)</label>
                                <input type="text" name="productType" value={formData.productType} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="e.g. Tops, Bottoms, Shirts" />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">Fit</label>
                                <input type="text" name="fit" value={formData.fit} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="e.g. Loose Fit, Slim Fit" />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">Colors (Comma separated)</label>
                                <input type="text" name="colors" value={formData.colors} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="e.g. Black, White, #FF0000" />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">Sizes (Comma separated)</label>
                                <input type="text" name="sizes" value={formData.sizes} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="e.g. S, M, L, XL" />
                             </div>
                          </div>

                          <div>
                             <label className="block text-sm font-medium text-gray-900 mb-1">Materials &amp; Care</label>
                             <textarea name="materials_care" rows="3" value={formData.materials_care} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="e.g. 100% Italian leather. Wipe clean with a dry cloth. Avoid prolonged exposure to moisture." />
                          </div>
 
                          <div>
                             <label className="block text-sm font-medium text-gray-900 mb-1">Materials Integrity</label>
                             <textarea name="materials_integrity" rows="3" value={formData.materials_integrity} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="e.g. Carbon-neutral certified. Ethically sourced leather from LWG certified tanneries." />
                          </div>

                          <div>
                             <label className="block text-sm font-medium text-gray-900 mb-1">Shipping &amp; Returns</label>
                             <textarea name="shipping_returns" rows="3" value={formData.shipping_returns} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border" placeholder="e.g. Free express shipping on all orders over ₹5000. Returns accepted within 14 days in original packaging." />
                          </div>

                          <div>
                             <label className="block text-sm font-medium text-gray-900 mb-3">Publish to Pages</label>
                             <div className="grid grid-cols-2 gap-3">
                               {[
                                 { key: 'new_arrivals',        label: 'New Arrivals (Home)' },
                                 { key: 'womens_collection',   label: "Women's Collection" },
                                 { key: 'mens_collection',     label: "Men's Collection" },
                                 { key: 'shop',                label: 'Shop Page' },
                                 { key: 'sale',                label: 'Sale / Offers' },
                                 { key: 'new_in',              label: 'New In' },
                                 { key: 'apparel',             label: 'Apparel' },
                                 { key: 'classics',            label: 'Classics' },
                                 { key: 'sportscollection',    label: 'Sport Collection' },
                                 { key: 'sports',              label: 'Sports' },
                               ].map(({ key, label }) => (
                                 <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                                   <input
                                     type="checkbox"
                                     checked={formData.pages.includes(key)}
                                     onChange={(e) => {
                                       setFormData(prev => ({
                                         ...prev,
                                         pages: e.target.checked
                                           ? [...prev.pages, key]
                                           : prev.pages.filter(p => p !== key)
                                       }));
                                     }}
                                     className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                   />
                                   <span className="text-sm text-gray-700">{label}</span>
                                 </label>
                               ))}
                             </div>
                          </div>

                          <div>
                             <label className="block text-sm font-medium text-gray-900 mb-1">Product Images</label>
                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                               <div className="space-y-1 text-center">
                                 <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                   <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                 </svg>
                                 <div className="flex text-sm text-gray-600 justify-center">
                                   <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                     <span>{isUploading ? 'Uploading...' : 'Upload files'}</span>
                                     <input id="file-upload" name="file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={isUploading} />
                                   </label>
                                 </div>
                                 <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                               </div>
                             </div>
                             
                             {formData.images?.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                   {formData.images.map((img, idx) => (
                                      <div key={idx} className="relative h-24 w-full rounded-lg bg-gray-100 overflow-hidden border border-gray-200 group">
                                         <img src={img} alt="Preview" className="h-full w-full object-cover" />
                                         <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                         </button>
                                      </div>
                                   ))}
                                </div>
                             )}
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  
                   <div className="flex-shrink-0 px-4 py-4 flex justify-end bg-gray-50 border-t border-gray-100">
                    <button type="button" onClick={resetForm} className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" form="product-form" className="flex justify-center py-2 px-8 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all">
                      {isEditing ? 'Save changes' : 'Create product'}
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

export default AdminDashboard;
