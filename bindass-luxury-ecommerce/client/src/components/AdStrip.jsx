import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
        return <img src={svgUrl} alt={value} className={`inline-block object-contain max-h-[1.4em] ${className}`} style={style} />;
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

const AdStrip = ({ page = 'home' }) => {
    const [stripAds, setStripAds] = useState([]);
    const [stripIndex, setStripIndex] = useState(0);
    const [isStripPaused, setIsStripPaused] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const { data } = await axios.get(`https://bindaas-ucyv.onrender.com/api/advertisements?bannerType=strip&page=${page}`);
                setStripAds(data);
                data.forEach(ad => {
                    [ad.tagFontFamily, ad.taglineFontFamily].forEach(f => f && loadGoogleFont(f));
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching strip ads:", error);
                setLoading(false);
            }
        };
        fetchAds();
    }, [page]);

    useEffect(() => {
        if (isStripPaused || stripAds.length <= 1) return;
        const timer = setInterval(() => {
            setStripIndex(prev => (prev + 1) % stripAds.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [isStripPaused, stripAds.length]);

    if (loading) return null;
    if (stripAds.length === 0) return null;

    return (
        <section
            className="bg-[#f5efe6] py-5 px-6 lg:px-12 border-y border-[#e8dfd4]"
            onMouseEnter={() => setIsStripPaused(true)}
            onMouseLeave={() => setIsStripPaused(false)}
        >
            <div className="max-w-[1440px] mx-auto relative overflow-hidden">
                {stripAds.map((ad, i) => (
                    <div
                        key={ad._id}
                        className="flex items-center justify-between gap-4 transition-all duration-500"
                        style={{ display: i === stripIndex ? 'flex' : 'none' }}
                    >
                        <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
                            <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, s) => (
                                    <svg key={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f0b429" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                    </svg>
                                ))}
                            </div>

                            <RenderText
                                value={ad.tag}
                                svgUrl={ad.tagSvgUrl}
                                bold={ad.tagBold}
                                italic={ad.tagItalic}
                                stroke={ad.tagStroke}
                                strokeColor={ad.tagStrokeColor}
                                strokeWidth={ad.tagStrokeWidth}
                                fontSize={ad.tagFontSize}
                                fontFamily={ad.tagFontFamily}
                                className="font-bold text-xs tracking-[0.2em]"
                                style={{ color: ad.tagColor || '#b45309' }}
                            />

                            <span className="hidden md:inline h-4 w-[1px] bg-black/10" />

                            <RenderText
                                value={ad.tagline}
                                svgUrl={ad.taglineSvgUrl}
                                bold={ad.taglineBold}
                                italic={ad.taglineItalic}
                                stroke={ad.taglineStroke}
                                strokeColor={ad.taglineStrokeColor}
                                strokeWidth={ad.taglineStrokeWidth}
                                fontSize={ad.taglineFontSize}
                                fontFamily={ad.taglineFontFamily}
                                className="text-xs font-medium tracking-widest opacity-80"
                                style={{ color: ad.taglineColor || '#92400e' }}
                            />

                            <span className="hidden md:inline h-4 w-[1px] bg-black/10" />

                            <span className="text-xs font-black tracking-wider text-gray-900">
                                {ad.deal} <span className="text-sm">{ad.discount}</span> {ad.dealSuffix}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                to={ad.ctaLink || '/shop'}
                                className="text-[10px] font-bold tracking-widest border-b-2 border-black pb-0.5 hover:opacity-50 transition-opacity"
                                style={{ color: ad.ctaColor || '#000000', borderColor: ad.ctaColor || '#000000' }}
                            >
                                {ad.ctaText}
                            </Link>
                        </div>
                    </div>
                ))}

                {stripAds.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                        {stripAds.map((_, i) => (
                            <button key={i} onClick={() => setStripIndex(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === stripIndex ? 'bg-[#1a1a1a] w-4' : 'bg-gray-400'}`} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AdStrip;
