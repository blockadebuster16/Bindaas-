import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const loadGoogleFont = (family) => {
    if (!family || document.querySelector(`link[data-gfont="${family}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    link.setAttribute('data-gfont', family);
    document.head.appendChild(link);
};

const RenderText = ({ value, svgUrl, bold, italic, stroke, strokeColor, strokeWidth, fontSize, fontFamily, className = '', style = {}, tag: Tag = 'span' }) => {
    if (svgUrl) {
        return <img src={svgUrl} alt={value} className={`block object-contain ${className}`} style={style} />;
    }
    const computedStyle = {
        ...style,
        fontWeight: bold ? '900' : undefined,
        fontStyle: italic ? 'italic' : undefined,
        WebkitTextStroke: stroke ? `${strokeWidth || '2'}px ${strokeColor || '#000000'}` : undefined,
        paintOrder: stroke ? 'stroke fill' : undefined,
        fontSize: fontSize ? `${fontSize}px` : undefined,
        fontFamily: fontFamily ? `'${fontFamily}', sans-serif` : undefined,
    };
    return <Tag className={className} style={computedStyle}>{value}</Tag>;
};

const AdFeatureShowcase = ({ page = 'home', adId = null }) => {
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                if (adId) {
                    const { data } = await axios.get(`${API_BASE_URL}/api/advertisements/${adId}`);
                    if (data && data.isActive) {
                        setAd(data);
                        if (data.titleFontFamily) loadGoogleFont(data.titleFontFamily);
                        if (data.tagFontFamily) loadGoogleFont(data.tagFontFamily);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch active showcase or heritage ads
                const { data } = await axios.get(`${API_BASE_URL}/api/advertisements?page=${page}`);
                if (data && Array.isArray(data)) {
                    const showcaseAd = data.find(a => a.bannerType === 'feature_showcase' || a.bannerType === 'heritage');
                    if (showcaseAd) {
                        setAd(showcaseAd);
                        if (showcaseAd.titleFontFamily) loadGoogleFont(showcaseAd.titleFontFamily);
                        if (showcaseAd.tagFontFamily) loadGoogleFont(showcaseAd.tagFontFamily);
                    }
                }
            } catch (err) {
                console.error("Error fetching Feature Showcase ad:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAd();
    }, [page, adId]);

    if (loading) return null;

    // Fallback default values if no ad is created in admin yet
    const tag = ad?.tag || 'THE HERITAGE';
    const title = ad?.title || "RENÉ'S LEGACY: THE CROCODILE";
    const subtitle = ad?.subtitle || "From the tennis courts of 1920s Paris to the streets of today, our crocodile symbol represents tenacity, elegance, and fair play.";
    const mediaUrl = ad?.mediaUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop";
    const mediaType = ad?.mediaType || 'image';
    const ctaLink = ad?.ctaLink || '/heritage';
    const ctaText = ad?.ctaText || 'DISCOVER THE STORY';

    return (
        <section className="bg-[#111111] text-white py-14 md:py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden border-y border-[#222222] font-sans">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                
                {/* Left Column: Text & CTA */}
                <div className="order-2 lg:order-1 flex flex-col justify-center items-start text-left">
                    <RenderText
                        tag="span"
                        value={tag}
                        svgUrl={ad?.tagSvgUrl}
                        bold={ad?.tagBold}
                        italic={ad?.tagItalic}
                        stroke={ad?.tagStroke}
                        strokeColor={ad?.tagStrokeColor}
                        strokeWidth={ad?.tagStrokeWidth}
                        fontSize={ad?.tagFontSize}
                        fontFamily={ad?.tagFontFamily}
                        className="text-[#FFD017] font-extrabold uppercase tracking-[0.25em] text-xs mb-4 md:mb-6 block"
                        style={{ color: ad?.tagColor || '#FFD017' }}
                    />

                    <RenderText
                        tag="h2"
                        value={title}
                        svgUrl={ad?.titleSvgUrl}
                        bold={ad?.titleBold}
                        italic={ad?.titleItalic}
                        stroke={ad?.titleStroke}
                        strokeColor={ad?.titleStrokeColor}
                        strokeWidth={ad?.titleStrokeWidth}
                        fontSize={ad?.titleFontSize}
                        fontFamily={ad?.titleFontFamily}
                        className="text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[1.1] mb-5 md:mb-8 font-['Playfair_Display',serif] text-white whitespace-pre-line"
                        style={{ color: ad?.titleColor || '#ffffff' }}
                    />

                    {subtitle && (
                        <RenderText
                            tag="p"
                            value={subtitle}
                            svgUrl={ad?.subtitleSvgUrl}
                            bold={ad?.subtitleBold}
                            italic={ad?.subtitleItalic}
                            fontSize={ad?.subtitleFontSize}
                            fontFamily={ad?.subtitleFontFamily}
                            className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 md:mb-10 max-w-lg font-light"
                            style={{ color: ad?.subtitleColor || '#cbd5e1' }}
                        />
                    )}

                    <Link
                        to={ctaLink}
                        className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/30 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#FFD017] hover:text-[#111111] hover:border-[#FFD017] transition-all duration-300 shadow-xl group"
                    >
                        <span>{ctaText}</span>
                    </Link>
                </div>

                {/* Right Column: Media Frame */}
                <div className="order-1 lg:order-2 relative w-full">
                    <div className="relative aspect-[4/3] lg:aspect-[16/11] bg-white/5 rounded-2xl overflow-hidden border border-[#FFD017]/30 shadow-2xl group">
                        {mediaType === 'video' ? (
                            <video
                                src={mediaUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        ) : (
                            <img
                                src={mediaUrl}
                                alt={title}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
                            />
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AdFeatureShowcase;
