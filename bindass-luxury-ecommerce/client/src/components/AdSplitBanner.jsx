import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const AdSplitBanner = ({ page }) => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/advertisements?bannerType=split&page=${page}`);
        const splitAd = Array.isArray(data) ? data[0] : null;
        setAd(splitAd);
      } catch (err) {
        console.error("Failed to fetch split ad", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [page]);

  if (loading || !ad) return null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {['splitLeft', 'splitRight'].map((side) => {
          const item = ad[side];
          if (!item || !item.mediaUrl) return null;

          return (
            <Link to={item.link || '#'} key={side} className="relative group block overflow-hidden bg-[#f5f5f5] w-full border-b md:border-b-0 border-white/20">
               <div className="relative aspect-[4/5] md:aspect-auto md:h-[650px] lg:h-[800px] w-full">
                 {item.mediaType === 'video' ? (
                   <video 
                     src={item.mediaUrl} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                     muted 
                     loop 
                     autoPlay 
                     playsInline
                   />
                 ) : (
                   <img 
                     src={item.mediaUrl} 
                     alt={item.title || 'Ad'} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                   />
                 )}
               </div>
               
               {/* Bottom Black Bar */}
               <div className="bg-[#111111] text-white px-6 py-5 flex justify-between items-center z-10 relative border-t-2 border-transparent group-hover:border-white transition-colors">
                  <span className="font-display font-bold text-sm tracking-[0.2em] uppercase">{item.title}</span>
                  <svg className="w-5 h-5 text-white transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
               </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdSplitBanner;
