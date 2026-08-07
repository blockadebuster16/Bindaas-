import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryHelper';

const AdBreak = ({ adData = null, fallbackTitle = 'WOMENSWEAR', fallbackImage = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop', fallbackLink = '/women' }) => {
    const ad = adData;

    const title = ad?.title || fallbackTitle;
    const mediaUrl = ad?.mediaUrl ? optimizeCloudinaryUrl(ad.mediaUrl) : fallbackImage;
    const mediaType = ad?.mediaType || 'image';
    const ctaLink = ad?.ctaLink || fallbackLink;
    const ctaText = ad?.ctaText || 'EXPLORE COLLECTION';

    return (
        <section className="w-full relative overflow-hidden bg-black mt-8 md:mt-16 mb-0 font-sans">
            <Link to={ctaLink} className="group block relative w-full min-h-[70vh] md:min-h-[85vh] lg:min-h-[90vh] h-[550px] md:h-[750px] lg:h-[850px] overflow-hidden">
                
                {/* Background Media (Image or Video) */}
                {mediaType === 'video' ? (
                    <video 
                        src={mediaUrl} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90"
                    />
                ) : (
                    <img 
                        src={mediaUrl} 
                        alt={title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90"
                        loading="lazy"
                        decoding="async"
                    />
                )}

                {/* Subtle Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 group-hover:from-black/80 transition-colors" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-20 px-6 text-center z-10">
                    
                    {ad?.tag && (
                        <span 
                            className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20"
                            style={{ color: ad.tagColor || '#ffffff' }}
                        >
                            {ad.tag}
                        </span>
                    )}

                    <h2 
                        className={`text-4xl md:text-7xl lg:text-9xl font-extrabold uppercase tracking-tighter leading-none mb-4 ${
                            ad?.titleStroke ? 'stroke-text text-transparent' : 'text-white'
                        }`}
                        style={{
                            color: ad?.titleStroke ? 'transparent' : (ad?.titleColor || '#ffffff'),
                            WebkitTextStroke: ad?.titleStroke ? `${ad?.titleStrokeWidth || '2'}px ${ad?.titleStrokeColor || '#ffffff'}` : 'none'
                        }}
                    >
                        {title}
                    </h2>

                    {ad?.subtitle && (
                        <p 
                            className="text-sm md:text-lg max-w-xl font-light tracking-widest uppercase mb-6 opacity-90"
                            style={{ color: ad.subtitleColor || '#ffffff' }}
                        >
                            {ad.subtitle}
                        </p>
                    )}

                    {/* CTA Button */}
                    <div className="mt-2">
                        <span className="btn-pill px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] bg-white text-black group-hover:bg-[#FFD017] group-hover:text-black transition-all shadow-2xl">
                            {ctaText}
                        </span>
                    </div>

                </div>
            </Link>
        </section>
    );
};

export default AdBreak;
