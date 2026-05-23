import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getCroppedUrl } from '../utils/cloudinaryHelper';\nimport API_BASE_URL from '../config/api';

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

const HeroSlide = ({ ad, i, heroIndex }) => {
    const getResponsiveMedia = () => {
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
    };

    const [mediaUrl, setMediaUrl] = useState(getResponsiveMedia());

    useEffect(() => {
        const handleResize = () => setMediaUrl(getResponsiveMedia());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [ad]);

    return (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {ad.mediaType === 'video' ? (
                <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline key={mediaUrl} />
            ) : (
                <img src={mediaUrl} alt={ad.title} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
            )}

            <div className="absolute inset-0 bg-black/10 flex flex-col justify-end p-12 lg:p-24 text-white pb-32">
                <div className="max-w-4xl animate-fade-in-up">
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
                            className="text-xs font-bold tracking-[0.3em] mb-4 opacity-80"
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
                        className="text-5xl lg:text-8xl font-serif font-bold leading-tight mb-4 tracking-tighter"
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
                            className="text-base lg:text-lg font-light mb-8 max-w-xl opacity-90"
                            style={{ color: ad.subtitleColor || '#ffffff' }}
                        />
                    )}

                    {ad.ctaText && (
                        <Link
                            to={ad.ctaLink || '/shop'}
                            className="inline-block border border-white px-10 py-4 bg-black/10 backdrop-blur-sm text-sm font-bold tracking-widest hover:bg-white hover:text-black transition-all"
                            style={{ color: ad.ctaColor || '#ffffff', borderColor: ad.ctaColor || '#ffffff' }}
                        >
                            {ad.ctaText}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdHero = ({ page = 'home' }) => {
    const [heroAds, setHeroAds] = useState([]);
    const [heroIndex, setHeroIndex] = useState(0);
    const [isHeroPaused, setIsHeroPaused] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const { data } = await axios.get(`https://bindaas-ucyv.onrender.com/api/advertisements?bannerType=hero&page=${page}`);
                setHeroAds(data);
                data.forEach(ad => {
                    [ad.titleFontFamily, ad.tagFontFamily, ad.subtitleFontFamily].forEach(f => f && loadGoogleFont(f));
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching hero ads:", error);
                setLoading(false);
            }
        };
        fetchAds();
    }, [page]);

    useEffect(() => {
        if (isHeroPaused || heroAds.length <= 1) return;
        const timer = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % heroAds.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isHeroPaused, heroAds.length]);

    if (loading) return null;
    if (heroAds.length === 0) return null;

    return (
        <section
            className="relative h-[85vh] w-full overflow-hidden group"
            onMouseEnter={() => setIsHeroPaused(true)}
            onMouseLeave={() => setIsHeroPaused(false)}
        >
            {heroAds.map((ad, i) => (
                <HeroSlide key={ad._id} ad={ad} i={i} heroIndex={heroIndex} />
            ))}

            {heroAds.length > 1 && (
                <>
                    <div className="absolute bottom-10 right-12 flex gap-4 z-20">
                        <button onClick={() => setHeroIndex(p => (p - 1 + heroAds.length) % heroAds.length)} className="w-12 h-12 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/10 backdrop-blur-sm transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
                        <button onClick={() => setHeroIndex(p => (p + 1) % heroAds.length)} className="w-12 h-12 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/10 backdrop-blur-sm transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                    </div>
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {heroAds.map((_, i) => (
                            <button key={i} onClick={() => setHeroIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === heroIndex ? 'bg-white w-6' : 'bg-white/30'}`} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default AdHero;
