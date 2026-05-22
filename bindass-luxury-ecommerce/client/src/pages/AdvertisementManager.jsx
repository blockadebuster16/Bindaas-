import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import AdminSidebar from '../components/AdminSidebar';

// ── Google Fonts catalogue ────────────────────────────────────────────────────
const FONT_GROUPS = [
  { group: 'Sans-serif', fonts: ['Inter','Roboto','Open Sans','Poppins','Montserrat','Nunito','Lato','Raleway','Oswald','Work Sans','DM Sans','Mulish','Barlow','Exo 2'] },
  { group: 'Serif',      fonts: ['Playfair Display','Merriweather','Cinzel','Cormorant Garamond','EB Garamond','Libre Baskerville','Lora'] },
  { group: 'Display',    fonts: ['Bebas Neue','Anton','Black Ops One','Righteous','Russo One','Teko','Graduate'] },
  { group: 'Script',     fonts: ['Dancing Script','Pacifico','Lobster','Sacramento','Great Vibes','Satisfy','Courgette'] },
  { group: 'Monospace',  fonts: ['Space Mono','Fira Code','JetBrains Mono','Source Code Pro'] },
];
const ALL_FONTS = FONT_GROUPS.flatMap(g => g.fonts);

const loadGoogleFont = (family) => {
  if (!family || document.querySelector(`link[data-gfont="${family}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g,'+')}:wght@300;400;500;600;700;800;900&display=swap`;
  link.setAttribute('data-gfont', family);
  document.head.appendChild(link);
};

const UPLOAD_URL = 'http://localhost:5001/api/upload/ad';

  const ColorSwatch = ({ label, name, currentColor, setFormData }) => {
    const swatches = [
      '#000000', '#FFFFFF', '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
      '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#10221c', '#b45309'
    ];
    return (
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">{label} Color</label>
        <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          {swatches.map(color => (
            <button key={color} type="button"
              onClick={() => setFormData(p => ({ ...p, [name]: color }))}
              className={`w-5 h-5 rounded-full border border-gray-100 transition-all ${currentColor === color ? 'ring-2 ring-emerald-500 scale-110 shadow-md' : 'hover:scale-105'}`}
              style={{ backgroundColor: color }} />
          ))}
          <div className="flex items-center ml-1 pl-2 border-l border-gray-100">
            <input type="color" value={currentColor}
              onChange={(e) => setFormData(p => ({ ...p, [name]: e.target.value }))}
              className="w-5 h-5 bg-transparent border-none cursor-pointer" />
          </div>
        </div>
      </div>
    );
  };

  const StyledTextField = ({ label, fieldKey, formData, setFormData, handleInputChange, showToast, getAuthHeaders, placeholder = '', inputClass = '' }) => {
    const boldKey        = `${fieldKey}Bold`;
    const italicKey      = `${fieldKey}Italic`;
    const strokeKey      = `${fieldKey}Stroke`;
    const strokeColorKey = `${fieldKey}StrokeColor`;
    const strokeWidthKey = `${fieldKey}StrokeWidth`;
    const svgUrlKey      = `${fieldKey}SvgUrl`;
    const familyKey      = `${fieldKey}FontFamily`;
    const sizeKey        = `${fieldKey}FontSize`;
    const hasSvg         = !!formData[svgUrlKey];
    const [svgUploading, setSvgUploading] = React.useState(false);

    const handleSvgUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('media', file);
      try {
        setSvgUploading(true);
        const { data } = await axios.post(UPLOAD_URL, fd, getAuthHeaders());
        setFormData(p => ({ ...p, [svgUrlKey]: data.url }));
        showToast('SVG uploaded');
      } catch { showToast('SVG upload failed', 'error'); }
      finally { setSvgUploading(false); }
    };

    const toggle = (key) => setFormData(p => ({ ...p, [key]: !p[key] }));

    const previewStyle = {
      fontWeight: formData[boldKey] ? '900' : 'normal',
      fontStyle: formData[italicKey] ? 'italic' : 'normal',
      fontFamily: formData[familyKey] ? `'${formData[familyKey]}', sans-serif` : 'inherit',
      fontSize: formData[sizeKey] ? `${formData[sizeKey]}px` : undefined,
      WebkitTextStroke: formData[strokeKey] ? `${formData[strokeWidthKey] || '2'}px ${formData[strokeColorKey] || '#000000'}` : undefined,
      paintOrder: formData[strokeKey] ? 'stroke fill' : undefined,
    };

    return (
      <div className="space-y-2.5">
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>

        {/* Text input OR SVG preview */}
        {hasSvg ? (
          <div className="relative bg-gray-900 rounded-xl overflow-hidden h-16 flex items-center justify-center">
            <img src={formData[svgUrlKey]} alt="svg text" className="max-h-full max-w-full object-contain px-4" />
            <button type="button"
              onClick={() => setFormData(p => ({ ...p, [svgUrlKey]: '' }))}
              className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-600"
            >×</button>
          </div>
        ) : (
          <input type="text" name={fieldKey} value={formData[fieldKey]} onChange={handleInputChange}
            placeholder={placeholder}
            className={`w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 ${inputClass}`}
            style={previewStyle}
          />
        )}

        {/* Row 1: B / I / Outline / Border color / SVG */}
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={() => toggle(boldKey)}
            className={`px-3 py-1.5 rounded-lg text-sm font-black border transition-all ${formData[boldKey] ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
          >B</button>

          <button type="button" onClick={() => toggle(italicKey)}
            className={`px-3 py-1.5 rounded-lg text-sm italic font-semibold border transition-all ${formData[italicKey] ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
          >I</button>

          <button type="button" onClick={() => toggle(strokeKey)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${formData[strokeKey] ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
          >Outline</button>

          {formData[strokeKey] && (
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Border</span>
              <input type="color" value={formData[strokeColorKey]}
                onChange={(e) => setFormData(p => ({ ...p, [strokeColorKey]: e.target.value }))}
                className="w-5 h-5 rounded cursor-pointer border-none bg-transparent" />
              <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
              <span className="text-[9px] font-bold text-gray-400">SIZE</span>
              <input type="number" min="1" max="20" value={formData[strokeWidthKey] || '2'}
                onChange={(e) => setFormData(p => ({ ...p, [strokeWidthKey]: e.target.value }))}
                className="w-10 text-xs font-medium bg-transparent border-none p-0 text-center focus:ring-0" />
              <span className="text-[9px] font-bold text-gray-400">px</span>
            </div>
          )}

          <label className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 cursor-pointer transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {svgUploading ? 'Uploading…' : 'SVG'}
            <input type="file" accept=".svg,image/svg+xml" onChange={handleSvgUpload} disabled={svgUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
        </div>

        {/* Row 2: Font family + Font size */}
        <div className="flex items-center gap-2">
          {/* Font family */}
          <div className="flex-1 relative">
            <select
              value={formData[familyKey]}
              onChange={(e) => {
                const family = e.target.value;
                setFormData(p => ({ ...p, [familyKey]: family }));
                if (family) loadGoogleFont(family);
              }}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-gray-900 appearance-none pr-7"
              style={{ fontFamily: formData[familyKey] ? `'${formData[familyKey]}', sans-serif` : 'inherit' }}
            >
              <option value="">Default Font</option>
              {FONT_GROUPS.map(g => (
                <optgroup key={g.group} label={`── ${g.group} ──`}>
                  {g.fonts.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* Font size */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase">Size</span>
            <input
              type="range" min="8" max="200"
              value={formData[sizeKey] || 16}
              onChange={(e) => setFormData(p => ({ ...p, [sizeKey]: e.target.value }))}
              className="w-20 h-1 accent-gray-900"
            />
            <span className="text-[10px] font-bold text-gray-700 w-8 text-right">
              {formData[sizeKey] || '—'}
              {formData[sizeKey] ? 'px' : ''}
            </span>
            {formData[sizeKey] && (
              <button type="button" onClick={() => setFormData(p => ({ ...p, [sizeKey]: '' }))}
                className="text-[9px] text-red-400 hover:text-red-600 font-bold ml-0.5">✕</button>
            )}
          </div>
        </div>
      </div>
    );
  };

const AdvertisementManager = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const STYLE_DEFAULTS = {
    titleBold: false, titleItalic: false, titleStroke: false, titleStrokeColor: '#000000', titleStrokeWidth: '2', titleSvgUrl: '', titleFontSize: '', titleFontFamily: '',
    tagBold: false,   tagItalic: false,   tagStroke: false,   tagStrokeColor: '#000000',   tagStrokeWidth: '2',   tagSvgUrl: '',   tagFontSize: '',   tagFontFamily: '',
    taglineBold: false, taglineItalic: false, taglineStroke: false, taglineStrokeColor: '#000000', taglineStrokeWidth: '2', taglineSvgUrl: '', taglineFontSize: '', taglineFontFamily: '',
    subtitleBold: false, subtitleItalic: false, subtitleStroke: false, subtitleStrokeColor: '#000000', subtitleStrokeWidth: '2', subtitleSvgUrl: '', subtitleFontSize: '', subtitleFontFamily: '',
  };

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    mediaType: 'image',
    mediaUrl: '',
    mediaUrlTablet: '',
    mediaUrlMobile: '',
    mediaCropTablet: null,
    mediaCropMobile: null,
    bannerType: 'hero',
    pages: [],
    tag: '',
    tagline: '',
    deal: '',
    discount: '',
    dealSuffix: 'OFF',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    isActive: true,
    order: 0,
    // Colors
    titleColor: '#ffffff',
    tagColor: '#ffffff',
    taglineColor: '#ffffff',
    subtitleColor: '#ffffff',
    ctaColor: '#ffffff',
    // Typography & SVG
    ...STYLE_DEFAULTS,
  });

  const API_URL = 'http://localhost:5001/api/advertisements';
  const UPLOAD_URL = 'http://localhost:5001/api/upload/ad';

  const fetchAds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get(`${API_URL}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(data);
    } catch (err) {
      setError("Failed to fetch advertisements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      mediaType: 'image',
      mediaUrl: '',
      mediaUrlTablet: '',
      mediaUrlMobile: '',
      mediaCropTablet: null,
      mediaCropMobile: null,
      bannerType: 'hero',
      pages: [],
      tag: '',
      tagline: '',
      deal: '',
      discount: '',
      dealSuffix: 'OFF',
      subtitle: '',
      ctaText: '',
      ctaLink: '',
      isActive: true,
      order: 0,
      titleColor: '#ffffff',
      tagColor: '#ffffff',
      taglineColor: '#ffffff',
      subtitleColor: '#ffffff',
      ctaColor: '#ffffff',
      ...STYLE_DEFAULTS,
    });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePageToggle = (pageKey) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.includes(pageKey)
        ? prev.pages.filter(p => p !== pageKey)
        : [...prev.pages, pageKey]
    }));
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('media', file);

    try {
      setIsUploading(true);
      const { data } = await axios.post(UPLOAD_URL, uploadData, getAuthHeaders());
      
      const urlField = activeDevice === 'mobile' ? 'mediaUrlMobile' : 
                      activeDevice === 'tablet' ? 'mediaUrlTablet' : 'mediaUrl';
      
      setFormData(prev => ({
        ...prev,
        [urlField]: data.url,
        mediaType: data.mediaType
      }));
      showToast(`${activeDevice.charAt(0).toUpperCase() + activeDevice.slice(1)} media uploaded`);
    } catch (err) {
      showToast('Failed to upload media', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${formData.id}`, formData, getAuthHeaders());
        showToast('Advertisement updated');
      } else {
        await axios.post(API_URL, formData, getAuthHeaders());
        showToast('Advertisement created');
      }
      resetForm();
      fetchAds();
    } catch (err) {
      showToast('Failed to save advertisement', 'error');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/toggle`, {}, getAuthHeaders());
      fetchAds();
      showToast('Status updated');
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this advertisement?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      fetchAds();
      showToast('Advertisement deleted');
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleEditClick = (ad) => {
    setFormData({
      id: ad._id,
      title: ad.title,
      mediaType: ad.mediaType,
      mediaUrl: ad.mediaUrl,
      mediaUrlTablet: ad.mediaUrlTablet || '',
      mediaUrlMobile: ad.mediaUrlMobile || '',
      mediaCropTablet: ad.mediaCropTablet || null,
      mediaCropMobile: ad.mediaCropMobile || null,
      bannerType: ad.bannerType,
      pages: ad.pages || [],
      tag: ad.tag || '',
      tagline: ad.tagline || '',
      deal: ad.deal || '',
      discount: ad.discount || '',
      dealSuffix: ad.dealSuffix || 'OFF',
      subtitle: ad.subtitle || '',
      ctaText: ad.ctaText || '',
      ctaLink: ad.ctaLink || '',
      isActive: ad.isActive,
      order: ad.order || 0,
      titleColor: ad.titleColor || '#ffffff',
      tagColor: ad.tagColor || '#ffffff',
      taglineColor: ad.taglineColor || '#ffffff',
      subtitleColor: ad.subtitleColor || '#ffffff',
      ctaColor: ad.ctaColor || '#ffffff',
      // Typography
      titleBold: ad.titleBold || false, titleItalic: ad.titleItalic || false, titleStroke: ad.titleStroke || false, titleStrokeColor: ad.titleStrokeColor || '#000000', titleStrokeWidth: ad.titleStrokeWidth || '2', titleSvgUrl: ad.titleSvgUrl || '', titleFontSize: ad.titleFontSize || '', titleFontFamily: ad.titleFontFamily || '',
      tagBold: ad.tagBold || false,     tagItalic: ad.tagItalic || false,     tagStroke: ad.tagStroke || false,     tagStrokeColor: ad.tagStrokeColor || '#000000',     tagStrokeWidth: ad.tagStrokeWidth || '2',     tagSvgUrl: ad.tagSvgUrl || '',     tagFontSize: ad.tagFontSize || '',     tagFontFamily: ad.tagFontFamily || '',
      taglineBold: ad.taglineBold || false, taglineItalic: ad.taglineItalic || false, taglineStroke: ad.taglineStroke || false, taglineStrokeColor: ad.taglineStrokeColor || '#000000', taglineStrokeWidth: ad.taglineStrokeWidth || '2', taglineSvgUrl: ad.taglineSvgUrl || '', taglineFontSize: ad.taglineFontSize || '', taglineFontFamily: ad.taglineFontFamily || '',
      subtitleBold: ad.subtitleBold || false, subtitleItalic: ad.subtitleItalic || false, subtitleStroke: ad.subtitleStroke || false, subtitleStrokeColor: ad.subtitleStrokeColor || '#000000', subtitleStrokeWidth: ad.subtitleStrokeWidth || '2', subtitleSvgUrl: ad.subtitleSvgUrl || '', subtitleFontSize: ad.subtitleFontSize || '', subtitleFontFamily: ad.subtitleFontFamily || '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // UI State
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeDevice, setActiveDevice] = useState('desktop'); // desktop, tablet, mobile
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const targetPages = [
    { key: 'home', label: 'Home Page' },
    { key: 'men', label: 'Men\'s Page' },
    { key: 'women', label: 'Women\'s Page' },
    { key: 'apparel', label: 'Apparel' },
    { key: 'classics', label: 'Classics' },
    { key: 'sports', label: 'Sports' },
    { key: 'shop', label: 'Shop Page' },
  ];




  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-display overflow-hidden">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center gap-3 transform transition-all duration-300 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          )}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900 leading-tight">Advertisement Center</h1>
               <p className="text-sm text-gray-500 mt-1">Manage hero banners and promotional grids.</p>
            </div>
            <div className="flex items-center gap-3">
               <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-primary hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Create New Ad
              </button>
            </div>
          </div>

          {/* Ads Grid Container */}
          {loading ? (
            <div className="flex justify-center flex-col items-center h-64 text-gray-500">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
               <p className="text-sm font-medium">Loading advertisements...</p>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white shadow-sm rounded-xl border border-gray-100">
               <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
               <h3 className="text-lg font-medium text-gray-900 px-2">No advertisements found</h3>
               <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Get started by creating your first banner or carousel slide.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <div key={ad._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                  <div className="relative h-44 bg-gray-100 overflow-hidden shrink-0">
                    {ad.mediaType === 'video' ? (
                      <video src={ad.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
                    ) : (
                      <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                       <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${ad.bannerType === 'hero' ? 'bg-gray-900 text-white' : ad.bannerType === 'strip' ? 'bg-emerald-600 text-white' : ad.bannerType === 'promo' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'}`}>
                        {ad.bannerType}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button onClick={() => handleEditClick(ad)} className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                       <button onClick={() => handleDelete(ad._id)} className="bg-white text-red-600 p-2 rounded-lg hover:bg-red-50 shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 text-base leading-tight" style={{ color: ad.titleColor }}>{ad.title}</h4>
                      <button 
                        onClick={() => handleToggleActive(ad._id)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${ad.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${ad.isActive ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {ad.pages?.map(p => (
                        <span key={p} className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">{p}</span>
                      ))}
                    </div>
                    {ad.bannerType === 'strip' && (
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl mb-4 text-[11px]">
                        <p className="font-bold uppercase tracking-wider" style={{ color: ad.tagColor }}>{ad.tag}</p>
                        <p className="text-gray-500" style={{ color: ad.taglineColor }}>{ad.tagline}</p>
                        <p className="mt-1 font-black text-gray-900">{ad.deal} {ad.discount} {ad.dealSuffix}</p>
                      </div>
                    )}
                    {ad.bannerType === 'middle' && (
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl mb-4 text-[11px]">
                        <p className="font-bold uppercase tracking-wider" style={{ color: ad.tagColor || '#6b7280' }}>{ad.tag}</p>
                        <p className="font-extrabold text-xs" style={{ color: ad.titleColor }}>{ad.title}</p>
                        <p style={{ color: ad.subtitleColor }}>{ad.subtitle}</p>
                      </div>
                    )}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Order: {ad.order}</span>
                      <span className="font-medium underline text-indigo-600 truncate max-w-[150px]" style={{ color: ad.ctaColor }}>{ad.ctaLink}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal / Slide-over */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" onClick={resetForm} />
          <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Advertisement' : 'New Advertisement'}</h3>
                <p className="text-sm text-gray-500 mt-1">Configure your media and targeting</p>
              </div>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-2 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </header>

            {/* Crop Modal Overlay */}
            {isCropping && (
              <div className="fixed inset-0 z-[60] bg-black flex flex-col">
                <div className="flex items-center justify-between p-4 bg-gray-900 text-white shrink-0">
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setIsCropping(false)} className="material-icons-outlined">arrow_back</button>
                    <h4 className="font-bold text-sm tracking-widest uppercase">Adjust {activeDevice} Crop</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setIsCropping(false)} className="text-sm font-bold opacity-60 hover:opacity-100 uppercase tracking-widest">Revert</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const cropField = activeDevice === 'mobile' ? 'mediaCropMobile' : 'mediaCropTablet';
                        setFormData(prev => ({ ...prev, [cropField]: { ...croppedAreaPixels, zoom } }));
                        setIsCropping(false);
                        showToast(`${activeDevice} crop saved`);
                      }}
                      className="bg-white text-black px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest hover:bg-gray-200"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div className="relative flex-1 bg-neutral-900 overflow-hidden">
                  <Cropper
                    image={formData.mediaUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={activeDevice === 'mobile' ? 9 / 16 : 4 / 3}
                    onCropChange={setCrop}
                    onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                    onZoomChange={setZoom}
                    showGrid={true}
                  />
                </div>

                <div className="p-8 bg-gray-900 border-t border-white/10 shrink-0">
                   <div className="max-w-xs mx-auto space-y-4">
                      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <span>Zoom</span>
                        <span>{Math.round(zoom * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.05" 
                        value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white" 
                      />
                   </div>
                </div>
              </div>
            )}

            <form id="ad-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
              {/* Type & Order */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Banner Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['hero', 'strip', 'middle', 'promo'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, bannerType: type, mediaType: type === 'promo' ? 'none' : prev.mediaType }))}
                        className={`py-2.5 px-5 rounded-xl border text-sm font-bold capitalize transition-all ${formData.bannerType === type ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}`}
                      >
                        {type}
                      </button>
                    ))}
                    <div className="flex items-center gap-3 ml-auto">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Order</label>
                      <input
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        className="w-20 bg-gray-50 border-none rounded-xl px-3 py-2.5 text-sm text-center focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Target Pages</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {targetPages.map(({ key, label }) => (
                    <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.pages.includes(key) ? 'bg-gray-50 border-gray-900 ring-1 ring-gray-900' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                      <input type="checkbox" checked={formData.pages.includes(key)} onChange={() => handlePageToggle(key)} className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.pages.includes(key) ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                        {formData.pages.includes(key) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className={`text-xs font-bold leading-none ${formData.pages.includes(key) ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Common Basic Details */}
              <div className="space-y-6">
                <StyledTextField
                  label="Slide Main Title"
                  fieldKey="title"
                  formData={formData}
                  setFormData={setFormData}
                  handleInputChange={handleInputChange}
                  showToast={showToast}
                  getAuthHeaders={getAuthHeaders}
                  placeholder="Promotional Headline"
                />
                <ColorSwatch 
                  label="Title" 
                  name="titleColor" 
                  currentColor={formData.titleColor} 
                  setFormData={setFormData}
                />
              </div>

              {/* Media Section */}
              {formData.bannerType !== 'promo' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Media (Cloudinary)</label>
                    
                    {/* Device Switcher */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      {[
                        { id: 'desktop', icon: 'desktop_windows' },
                        { id: 'tablet', icon: 'tablet_mac' },
                        { id: 'mobile', icon: 'stay_current_portrait' }
                      ].map(device => (
                        <button
                          key={device.id}
                          type="button"
                          onClick={() => setActiveDevice(device.id)}
                          className={`p-1.5 rounded-md transition-all flex items-center justify-center ${activeDevice === device.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <span className="material-icons-outlined text-[18px]">{device.icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div 
                    className={`relative rounded-2xl overflow-hidden border-2 border-dashed transition-all flex flex-col items-center justify-center
                      ${activeDevice === 'mobile' ? 'aspect-[9/16] max-w-[240px] mx-auto' : activeDevice === 'tablet' ? 'aspect-[4/3] max-w-[400px] mx-auto' : 'h-56'}
                      ${(activeDevice === 'mobile' ? formData.mediaUrlMobile : activeDevice === 'tablet' ? formData.mediaUrlTablet : formData.mediaUrl) ? 'border-solid border-gray-900' : 'border-gray-200 bg-gray-50'}`}
                  >
                    {/* Preview Logic */}
                    {(activeDevice === 'mobile' ? formData.mediaUrlMobile : activeDevice === 'tablet' ? formData.mediaUrlTablet : formData.mediaUrl) ? (
                      <>
                        {formData.mediaType === 'video' ? (
                          <video 
                            src={activeDevice === 'mobile' ? (formData.mediaUrlMobile || formData.mediaUrl) : activeDevice === 'tablet' ? (formData.mediaUrlTablet || formData.mediaUrl) : formData.mediaUrl} 
                            className="w-full h-full object-cover" 
                            muted loop autoPlay 
                          />
                        ) : (
                          <img 
                            src={activeDevice === 'mobile' ? (formData.mediaUrlMobile || formData.mediaUrl) : activeDevice === 'tablet' ? (formData.mediaUrlTablet || formData.mediaUrl) : formData.mediaUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <button 
                            type="button" 
                            onClick={() => {
                              const field = activeDevice === 'mobile' ? 'mediaUrlMobile' : 
                                           activeDevice === 'tablet' ? 'mediaUrlTablet' : 'mediaUrl';
                              setFormData(prev => ({ ...prev, [field]: '' }));
                            }} 
                            className="bg-white/90 backdrop-blur p-2 rounded-xl text-red-600 shadow-xl hover:bg-white"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>

                        {/* Inheritance Badge */}
                        {activeDevice !== 'desktop' && !(activeDevice === 'mobile' ? formData.mediaUrlMobile : formData.mediaUrlTablet) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                            <span className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                              Inheriting Desktop View
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-8">
                        <div className="bg-white w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                           <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                        <p className="text-xs font-bold text-gray-900 mb-1">{isUploading ? 'Uploading...' : `Upload ${activeDevice} Visual`}</p>
                        <p className="text-[10px] text-gray-400 px-8">High-res JPG/PNG or MP4 video</p>
                        <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    )}
                  </div>
                  
                  {/* Status Indicator & Controls */}
                  {activeDevice !== 'desktop' && formData.mediaUrl && (
                    <div className="flex flex-col items-center gap-3">
                         <div className="flex items-center gap-2">
                            {!(activeDevice === 'mobile' ? formData.mediaUrlMobile : formData.mediaUrlTablet) && (
                              <button 
                                type="button"
                                onClick={() => {
                                   const existingCrop = activeDevice === 'mobile' ? formData.mediaCropMobile : formData.mediaCropTablet;
                                   if (existingCrop) setZoom(existingCrop.zoom || 1);
                                   setIsCropping(true);
                                }}
                                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-md"
                              >
                                { (activeDevice === 'mobile' ? formData.mediaCropMobile : formData.mediaCropTablet) ? (
                                  <><span className="material-icons-outlined text-[16px]">crop</span> Adjust Crop</>
                                ) : (
                                  <><span className="material-icons-outlined text-[16px]">crop</span> Crop Master Image</>
                                )}
                              </button>
                            )}
                            
                            {(activeDevice === 'mobile' ? formData.mediaCropMobile : formData.mediaCropTablet) && (
                                <button 
                                   type="button"
                                   onClick={() => {
                                      const field = activeDevice === 'mobile' ? 'mediaCropMobile' : 'mediaCropTablet';
                                      setFormData(p => ({ ...p, [field]: null }));
                                   }}
                                   className="material-icons-outlined text-red-500 hover:bg-red-50 p-2 rounded-xl"
                                >
                                   delete_sweep
                                </button>
                            )}
                         </div>

                      <p className="text-[10px] text-center text-gray-400 italic">
                        { (activeDevice === 'mobile' ? formData.mediaUrlMobile : formData.mediaUrlTablet) 
                          ? `Custom ${activeDevice} image set.` 
                          : (activeDevice === 'mobile' ? formData.mediaCropMobile : formData.mediaCropTablet)
                            ? `Master image cropped for ${activeDevice}.`
                            : `Showing desktop version for ${activeDevice}. Crop or upload above.` }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Promo Banner Specific Fields */}
              {formData.bannerType === 'promo' && (
                <div className="bg-indigo-50 rounded-2xl p-6 space-y-6 animate-fadeIn">
                   <h5 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                     Promo Bar Details
                   </h5>
                   <p className="text-xs text-gray-500">The Promo Bar displays at the very top of the website. The Main Title is used as the text.</p>
                   <div className="grid grid-cols-2 gap-4">
                     <ColorSwatch label="Background" name="tagColor" currentColor={formData.tagColor} setFormData={setFormData} />
                     <ColorSwatch label="Text" name="titleColor" currentColor={formData.titleColor} setFormData={setFormData} />
                   </div>
                </div>
              )}

              {/* Hero Banner Specific Fields */}
              {formData.bannerType === 'hero' && (
                <div className="bg-gray-900/5 rounded-2xl p-6 space-y-5 animate-fadeIn">
                   <h5 className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-gray-700 rounded-full" />
                     Hero Banner Details
                   </h5>
                   <StyledTextField label="Eyebrow Tag (e.g. NEW COLLECTION)" fieldKey="tag" formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} showToast={showToast} getAuthHeaders={getAuthHeaders} placeholder="NEW SEASON" inputClass="font-bold" />
                   <ColorSwatch label="Tag" name="tagColor" currentColor={formData.tagColor} setFormData={setFormData} />
                   <StyledTextField label="Sub-title" fieldKey="subtitle" formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} showToast={showToast} getAuthHeaders={getAuthHeaders} placeholder="Discover the latest arrivals" />
                   <ColorSwatch label="Subtitle" name="subtitleColor" currentColor={formData.subtitleColor} setFormData={setFormData} />
                </div>
              )}

              {/* Middle Banner Specific Fields */}
              {formData.bannerType === 'middle' && (
                <div className="bg-purple-50 rounded-2xl p-6 space-y-5 animate-fadeIn">
                   <h5 className="text-[11px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                     Middle Banner Details
                   </h5>
                   <StyledTextField label="Top Tagline (e.g. #NewStyles)" fieldKey="tag" formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} showToast={showToast} getAuthHeaders={getAuthHeaders} placeholder="#NewStyles" inputClass="font-bold" />
                   <ColorSwatch label="Tag" name="tagColor" currentColor={formData.tagColor} setFormData={setFormData} />
                   <StyledTextField label="Sub-title (e.g. STYLES FOR EVERY...)" fieldKey="subtitle" formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} showToast={showToast} getAuthHeaders={getAuthHeaders} placeholder="STYLES FOR EVERY OCCASION" />
                   <ColorSwatch label="Subtitle" name="subtitleColor" currentColor={formData.subtitleColor} setFormData={setFormData} />
                </div>
              )}

              {/* Strip Specific Fields */}
              {formData.bannerType === 'strip' && (
                <div className="bg-gray-50 rounded-2xl p-6 space-y-5 animate-fadeIn">
                   <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                     Strip Details
                   </h5>
                   <StyledTextField label="Tag (e.g. BESTSELLERS)" fieldKey="tag" formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} showToast={showToast} getAuthHeaders={getAuthHeaders} placeholder="BESTSELLERS" inputClass="font-bold" />
                   <ColorSwatch label="Tag" name="tagColor" currentColor={formData.tagColor} setFormData={setFormData} />
                   <StyledTextField label="Tagline" fieldKey="tagline" formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} showToast={showToast} getAuthHeaders={getAuthHeaders} placeholder="Free shipping on orders above ₹2000" />
                   <ColorSwatch label="Tagline" name="taglineColor" currentColor={formData.taglineColor} setFormData={setFormData} />
                   <div className="grid grid-cols-3 gap-4">
                     <div>
                       <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Deal Prefix</label>
                       <input type="text" name="deal" value={formData.deal} onChange={handleInputChange} className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-gray-900" placeholder="UPTO" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Discount</label>
                       <input type="text" name="discount" value={formData.discount} onChange={handleInputChange} className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-black focus:ring-2 focus:ring-gray-900" placeholder="30%" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Suffix</label>
                       <input type="text" name="dealSuffix" value={formData.dealSuffix} onChange={handleInputChange} className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-gray-900" placeholder="OFF" />
                     </div>
                   </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                   <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                     Action Configuration
                   </h5>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">CTA Text</label>
                        <input type="text" name="ctaText" value={formData.ctaText} onChange={handleInputChange} className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-emerald-500" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">CTA Link</label>
                        <input type="text" name="ctaLink" value={formData.ctaLink} onChange={handleInputChange} className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-emerald-500" />
                     </div>
                   </div>
                   <ColorSwatch label="CTA Button/Text" name="ctaColor" currentColor={formData.ctaColor} setFormData={setFormData} />
                </div>
            </form>

            <div className="flex-shrink-0 px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancel</button>
              <button type="submit" form="ad-form" className="px-10 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-black shadow-lg shadow-gray-200 transition-all">Save Advertisement</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
           {toast.type === 'error' ? (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           ) : (
             <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           )}
           <span className="text-sm font-bold tracking-tight">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default AdvertisementManager;
