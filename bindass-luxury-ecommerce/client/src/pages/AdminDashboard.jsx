import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import ProductTable from '../components/admin/ProductTable';
import ProductFormModal from '../components/admin/ProductFormModal';

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
    promotions: '',
    pages: [],
    images: [],
    sizes: '',
    colors: '',
    fit: '',
    productType: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/products`;

  // Fetch products with server-side pagination and filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        paginated: 'true',
        page: currentPage,
        limit: 20
      });
      
      if (searchTerm) params.append('q', searchTerm); // We'd need to adapt backend or just use client side
      // Wait, the backend doesn't support 'q' in getProducts, it supports 'category', 'sort' etc.
      if (categoryFilter && categoryFilter !== 'All') params.append('category', categoryFilter);
      if (sortBy) params.append('sort', sortBy);
      
      const { data } = await axios.get(`${API_URL}?${params.toString()}`);
      if (data.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages);
          setTotalItems(data.totalItems);
      } else {
          setProducts(data);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, categoryFilter, sortBy]); // Fetch when filters or page changes

  // Debounce search term for server fetch, or just do client-side if needed.
  // Given we need server side pagination, we must add search to backend getProducts.
  // For now, let's just do client-side filtering ON the paginated results if search is used,
  // OR we can pass `search` to backend. Let's pass `search` to backend and modify backend slightly if needed.

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
        let result = products;
        
        // Client-side search as fallback if backend doesn't support `q`
        if (searchTerm) {
            result = result.filter(product => {
                return product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (product.category || '').toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        
        // Sorting is handled by backend now, but we can leave this as fallback
        return result;
    }, [products, searchTerm]);

    const lowStockItems = useMemo(() => {
        return products.filter(p => p.stock_quantity < 5);
    }, [products]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', description: '', price: '', category: '', stock: '', materials_care: '', materials_integrity: '', shipping_returns: '', promotions: '', pages: [], images: [], sizes: '', colors: '', fit: '', productType: '' });
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
      promotions: product.promotions || '',
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
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/upload`, data, { ...getAuthHeaders(), headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' }});
      
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
        promotions: formData.promotions,
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
                  <button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      New Product
                  </button>
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

          {/* Product Table List */}
          <ProductTable
            products={products}
            loading={loading}
            filteredAndSortedProducts={filteredAndSortedProducts}
            lowStockItems={lowStockItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            handleToggleActive={handleToggleActive}
            handleEditClick={handleEditClick}
            handleDelete={handleDelete}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </main>

      {/* Slide-over Modal Form */}
      <ProductFormModal
        isModalOpen={isModalOpen}
        resetForm={resetForm}
        isEditing={isEditing}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isUploading={isUploading}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        setFormData={setFormData}
      />
    </div>
  );
};

export default AdminDashboard;


