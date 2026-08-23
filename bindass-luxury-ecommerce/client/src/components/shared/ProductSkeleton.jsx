import React from 'react';

const ProductSkeleton = () => {
    return (
        <div className="group block relative font-sans w-full">
            {/* Image Card Container Skeleton with Grey Outer Frame */}
            <div className="p-2 sm:p-2.5 bg-[#EAEAEA] rounded-2xl sm:rounded-3xl mb-2.5 shadow-sm">
                <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-200 animate-pulse">
                    {/* Bookmark Badge Skeleton */}
                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-7 h-8 sm:w-8 sm:h-9 bg-white/50 rounded-sm"></div>
                </div>
            </div>

            {/* Title & Price Row Skeleton */}
            <div className="flex flex-col px-1 gap-1.5 mt-2">
                <div className="h-3.5 bg-slate-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded animate-pulse w-1/3 mt-0.5"></div>
            </div>
        </div>
    );
};

export default ProductSkeleton;
