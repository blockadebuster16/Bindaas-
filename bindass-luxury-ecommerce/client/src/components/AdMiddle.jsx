import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { getCroppedUrl } from '../utils/cloudinaryHelper';

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

const MiddleAdContent = ({ ad }) => {
    const getResponsiveMedia = useCallback(() => {
        if (typeof window === 'undefined') return ad.mediaUrl;
        const w = window.innerWidth;
        
        if (w < 640) {
            if (ad.mediaUrlMobile) return ad.mediaUrlMobile;
            if (ad.mediaCropMobile) return getCroppedUrl(ad.mediaUrl, ad.mediaCropMobile);
            return ad.mediaUrl;
        }
        
        if (w < 1024) {
            if (ad.mediaUrlTablet) return ad.mediaUrlTablet;
            if (ad.mediaCropTablet) return getCroppedUrl(ad.mediaUrl, ad.mediaCropTablet);
            return ad.mediaUrl;
        }
        
        return ad.mediaUrl;
    }, [ad]);

    const [mediaUrl, setMediaUrl] = useState(getResponsiveMedia());

    // Update image URL if the advertisement object changes dynamically
    useEffect(() => {
        setMediaUrl(getResponsiveMedia());
    }, [getResponsiveMedia]);

    // Handle responsive window resizing
    useEffect(() => {
        const handleResize = () => {
            setMediaUrl(getResponsiveMedia());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [getResponsiveMedia]);

    return (
        <section className="relative w-full h-[300px] lg:h-[400px] overflow-hidden my-12">
            {ad.mediaType === 'video' ? (
                <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    key={mediaUrl}
                />
            ) : (
                <img
                    src={mediaUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    key={mediaUrl}
                />
            )}

            <div className="absolute inset-0 bg-black/20 flex items-center px-12 lg:px-24">
                <div className="max-w-xl text-white">
                    {ad.tag && (
                        <RenderText
                            tag="p"
                            value={ad.tag}
                            svgUrl={ad.tagSvgUrl}
                            bold={ad.tagBold}
                            italic={ad.tagItalic}
                            stroke={ad.tagStroke}
                            strokeColor={ad.tagStrokeColor}
                            strokeWidth={ad.tagStrokeWidth}
                            fontSize={ad.tagFontSize}
                            fontFamily={ad.tagFontFamily}
                            className="text-xs lg:text-sm font-medium tracking-widest mb-2 opacity-90"
                            style={{ color: ad.tagColor || '#ffffff' }}
                        />
                    )}

                    <RenderText
                        tag="h2"
                        value={ad.title}
                        svgUrl={ad.titleSvgUrl}
                        bold={ad.titleBold}
                        italic={ad.titleItalic}
                        stroke={ad.titleStroke}
                        strokeColor={ad.titleStrokeColor}
                        strokeWidth={ad.titleStrokeWidth}
                        fontSize={ad.titleFontSize}
                        fontFamily={ad.titleFontFamily}
                        className="text-4xl lg:text-6xl font-serif font-bold leading-tight mb-2 tracking-tighter"
                        style={{ color: ad.titleColor || '#ffffff' }}
                    />

                    {ad.subtitle && (
                        <RenderText
                            tag="p"
                            value={ad.subtitle}
                            svgUrl={ad.subtitleSvgUrl}
                            bold={ad.subtitleBold}
                            italic={ad.subtitleItalic}
                            stroke={ad.subtitleStroke}
                            strokeColor={ad.subtitleStrokeColor}
                            strokeWidth={ad.subtitleStrokeWidth}
                            fontSize={ad.subtitleFontSize}
                            fontFamily={ad.subtitleFontFamily}
                            className="text-sm lg:text-lg font-medium tracking-wider mb-8 opacity-80"
                            style={{ color: ad.subtitleColor || '#ffffff' }}
                        />
                    )}

                    {ad.ctaText && (
                        <Link
                            to={ad.ctaLink || '/shop'}
                            className="inline-block border border-white px-8 py-3 bg-black/10 backdrop-blur-sm text-sm font-bold tracking-widest hover:bg-white hover:text-black transition-all"
                            style={{ color: ad.ctaColor || '#ffffff', borderColor: ad.ctaColor || '#ffffff' }}
                        >
                            {ad.ctaText}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

const AdMiddle = ({ page = 'home' }) => {
    const [middleAds, setMiddleAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/advertisements?bannerType=middle&page=${page}`);
                setMiddleAds(data);
                data.forEach(ad => {
                    [ad.titleFontFamily, ad.tagFontFamily, ad.subtitleFontFamily].forEach(f => f && loadGoogleFont(f));
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching middle ads:", error);
                setLoading(false);
            }
        };
        fetchAds();
    }, [page]);

    if (loading || middleAds.length === 0) return null;

    return <MiddleAdContent ad={middleAds[0]} />;
};

export default AdMiddle;
