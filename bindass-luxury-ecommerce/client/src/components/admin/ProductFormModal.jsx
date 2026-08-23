import React from 'react';

const ProductFormModal = ({
    isModalOpen,
    resetForm,
    isEditing,
    formData,
    handleInputChange,
    handleSubmit,
    isUploading,
    handleImageUpload,
    removeImage,
    setFormData
}) => {
    if (!isModalOpen) return null;

    return (
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
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
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
                                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="e.g. Rolex Submariner" />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                                                <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="Product details..." />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                                                    <div className="relative rounded-md shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">₹</span>
                                                        </div>
                                                        <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleInputChange} className="block w-full pl-7 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="0.00" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-1">Inventory</label>
                                                    <input type="number" name="stock" min="0" value={formData.stock} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="0" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 mb-1">Category (Primary)</label>
                                                <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="e.g. Watches, Accessories" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-1">Product Type (Variant Cat)</label>
                                                    <input type="text" name="productType" value={formData.productType} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="e.g. Tops, Bottoms, Shirts" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-1">Fit</label>
                                                    <input type="text" name="fit" value={formData.fit} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="e.g. Loose Fit, Slim Fit" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-1">Colors (Comma separated)</label>
                                                    <input type="text" name="colors" value={formData.colors} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="e.g. Black, White, #FF0000" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-1">Sizes (Comma separated)</label>
                                                    <input type="text" name="sizes" value={formData.sizes} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="e.g. S, M, L, XL" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 mb-1">Materials &amp; Care</label>
                                                <textarea name="materials_care" rows="3" value={formData.materials_care} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="e.g. 100% Italian leather. Wipe clean with a dry cloth. Avoid prolonged exposure to moisture." />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 mb-1">Materials Integrity</label>
                                                <textarea name="materials_integrity" rows="3" value={formData.materials_integrity} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="e.g. Carbon-neutral certified. Ethically sourced leather from LWG certified tanneries." />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 mb-1">Shipping &amp; Returns</label>
                                                <textarea name="shipping_returns" rows="3" value={formData.shipping_returns} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="e.g. Free express shipping on all orders over ₹5000. Returns accepted within 14 days in original packaging." />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 mb-1">Promotions &amp; Offers</label>
                                                <textarea name="promotions" rows="3" value={formData.promotions} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border" placeholder="e.g. Get 10% off using code LUXURY10." />
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
                                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
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
                                
                                <div className="flex-shrink-0 px-4 py-4 flex justify-end bg-gray-50 border-t border-gray-100">
                                    <button type="button" onClick={resetForm} className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none mr-3 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" form="product-form" className="flex justify-center py-2 px-8 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-black focus:outline-none transition-all">
                                        {isEditing ? 'Save changes' : 'Create product'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProductFormModal;
