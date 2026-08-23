import React from 'react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const ProductTable = ({
    products,
    loading,
    filteredAndSortedProducts,
    lowStockItems,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    handleToggleActive,
    handleEditClick,
    handleDelete,
    currentPage,
    totalPages,
    setCurrentPage
}) => {
    return (
        <>
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
                        <option value="price-asc">Price: Low to High (Legacy)</option>
                        <option value="price-desc">Price: High to Low (Legacy)</option>
                        <option value="stock-asc">Stock: Low to High</option>
                        <option value="stock-desc">Stock: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center flex-col items-center h-64 text-gray-500">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
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
        </>
    );
};

export default ProductTable;
