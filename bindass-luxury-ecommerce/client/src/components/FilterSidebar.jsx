import React, { useState } from 'react';

const FilterAccordion = ({ title, children, showArrow = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-[#E8E3D8]">
            <div 
                className="flex justify-between items-center py-4 hover:bg-[#FAE7A8]/60 cursor-pointer px-1 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-[10px] tracking-[0.2em] text-[#111111] font-bold uppercase font-['Outfit','Manrope',sans-serif]">{title}</span>
                {showArrow ? (
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        className={`w-4 h-4 text-gray-800 transition-transform ${isOpen ? '-rotate-180' : ''}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-800">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                )}
            </div>
            {isOpen && children && (
                <div className="pb-4 pt-1 animate-fadeIn">
                    {children}
                </div>
            )}
        </div>
    );
};

const CheckboxOption = ({ label, count, checked, onChange }) => (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer group">
        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${checked ? 'bg-[#111111] border-[#111111] text-white' : 'border-[#D4AF37] bg-[#FAE7A8] group-hover:border-[#111111]'}`}>
            {checked && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <span className="text-xs text-[#111111] flex-1 font-medium">{label}</span>
        {count !== undefined && <span className="text-xs text-[#6B6457]">[{count}]</span>}
    </label>
);

const FilterSidebar = ({ 
    isOpen, 
    onClose, 
    totalResults = 0,
    filters,
    setFilters,
    availableOptions,
    clearAll
}) => {
    
    const handleCheckboxChange = (category, value) => {
        setFilters(prev => {
            const current = prev[category] || [];
            if (current.includes(value)) {
                return { ...prev, [category]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [category]: [...current, value] };
            }
        });
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Drawer */}
            <div 
                className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col font-['Outfit','Manrope',sans-serif] ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E3D8]">
                    <span className="text-xs uppercase tracking-[0.2em] font-medium opacity-0">S</span> 
                    <h2 className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#111111] absolute left-1/2 -translate-x-1/2">
                        Filter
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-[#111111] hover:text-[#D4AF37] transition-colors p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    
                    {/* Price Range - Using simple text input for min/max to be fully robust without external slider libs */}
                    <div className="mb-10 block">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] tracking-[0.2em] text-[#111111] font-bold uppercase">PRICE RANGE (₹)</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input 
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                                className="w-full text-xs border-b border-[#D4AF37] py-1 bg-transparent focus:outline-none focus:border-[#111111] transition-colors text-[#111111] placeholder:text-[#6B6457]"
                            />
                            <span className="text-[#6B6457]">–</span>
                            <input 
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                                className="w-full text-xs border-b border-[#D4AF37] py-1 bg-transparent focus:outline-none focus:border-[#111111] transition-colors text-[#111111] placeholder:text-[#6B6457]"
                            />
                        </div>
                    </div>

                    {/* Accordions */}
                    <div className="space-y-2">
                        <FilterAccordion title="COLOUR">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {availableOptions.colors.map(color => (
                                    <CheckboxOption 
                                        key={color} 
                                        label={color} 
                                        checked={(filters.colors || []).includes(color)}
                                        onChange={() => handleCheckboxChange('colors', color)}
                                        count={availableOptions.counts.colors[color]}
                                    />
                                ))}
                            </div>
                        </FilterAccordion>

                        <FilterAccordion title="SIZE">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {availableOptions.sizes.map(size => (
                                    <CheckboxOption 
                                        key={size} 
                                        label={size} 
                                        checked={(filters.sizes || []).includes(size)}
                                        onChange={() => handleCheckboxChange('sizes', size)}
                                        count={availableOptions.counts.sizes[size]}
                                    />
                                ))}
                            </div>
                        </FilterAccordion>

                        <FilterAccordion title="PRODUCT TYPE">
                            <div className="grid grid-cols-1 gap-y-1">
                                {availableOptions.productTypes.map(type => (
                                    <CheckboxOption 
                                        key={type} 
                                        label={type} 
                                        checked={(filters.productTypes || []).includes(type)}
                                        onChange={() => handleCheckboxChange('productTypes', type)}
                                        count={availableOptions.counts.types[type]}
                                    />
                                ))}
                            </div>
                        </FilterAccordion>

                        <FilterAccordion title="FIT">
                             <div className="grid grid-cols-1 gap-y-1">
                                {availableOptions.fits.map(fit => (
                                    <CheckboxOption 
                                        key={fit} 
                                        label={fit} 
                                        checked={(filters.fits || []).includes(fit)}
                                        onChange={() => handleCheckboxChange('fits', fit)}
                                        count={availableOptions.counts.fits[fit]}
                                    />
                                ))}
                            </div>
                        </FilterAccordion>

                    </div>
                </div>

                {/* Footer fixed */}
                <div className="p-6 border-t border-[#E8E3D8] bg-white grid grid-cols-2 gap-4">
                    <button 
                        onClick={clearAll}
                        className="py-4 text-[10px] font-bold tracking-[0.15em] text-[#111111] bg-[#E8E3D8] hover:bg-[#D4AF37] transition-colors uppercase leading-none border border-[#D4AF37]"
                    >
                        Clear All
                    </button>
                    <button 
                        onClick={onClose}
                        className="py-4 text-[10px] font-bold tracking-[0.15em] text-white bg-[#111111] hover:bg-[#FFD017] hover:text-[#111111] transition-all duration-300 uppercase leading-none"
                    >
                        View [{totalResults}]
                    </button>
                </div>
            </div>
        </>
    );
};

export default FilterSidebar;
