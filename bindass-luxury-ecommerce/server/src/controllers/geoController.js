const axios = require('axios');
const supabase = require('../config/supabase');
const { resolveZone } = require('../utils/zoneMap');

// ── Hardcoded fallback (used if Supabase is not configured) ────────────────
const FALLBACK_ZONES = {
    'INDIA': { zone_name:'INDIA', display_name:'India', currency_code:'INR', currency_symbol:'₹', base_shipping_fee:250, free_shipping_threshold:40000, vat_rate:18, de_minimis:0, duty_note:null, climate_fee:25 },
    'USA':   { zone_name:'USA',   display_name:'United States', currency_code:'USD', currency_symbol:'$', base_shipping_fee:30, free_shipping_threshold:500, vat_rate:8, de_minimis:800, duty_note:'Import duties may apply for shipments above $800. These are the buyer\'s responsibility (DDU).', climate_fee:0.30 },
    'UK':    { zone_name:'UK',    display_name:'United Kingdom', currency_code:'GBP', currency_symbol:'£', base_shipping_fee:25, free_shipping_threshold:450, vat_rate:20, de_minimis:135, duty_note:'UK VAT & duties may apply. These are the buyer\'s responsibility (DDU).', climate_fee:0.25 },
    'EU':    { zone_name:'EU',    display_name:'Europe', currency_code:'EUR', currency_symbol:'€', base_shipping_fee:25, free_shipping_threshold:500, vat_rate:21, de_minimis:150, duty_note:'EU VAT & customs may apply. These are the buyer\'s responsibility (DDU).', climate_fee:0.25 },
    'UAE':   { zone_name:'UAE',   display_name:'UAE', currency_code:'AED', currency_symbol:'د.إ', base_shipping_fee:100, free_shipping_threshold:2000, vat_rate:5, de_minimis:1000, duty_note:'UAE VAT may apply on imports. These are the buyer\'s responsibility (DDU).', climate_fee:1.00 },
    'SEA':   { zone_name:'SEA',   display_name:'South East Asia', currency_code:'USD', currency_symbol:'$', base_shipping_fee:25, free_shipping_threshold:400, vat_rate:10, de_minimis:50, duty_note:'Local import duties may apply. These are the buyer\'s responsibility (DDU).', climate_fee:0.25 },
    'AUS':   { zone_name:'AUS',   display_name:'Australia', currency_code:'AUD', currency_symbol:'A$', base_shipping_fee:40, free_shipping_threshold:750, vat_rate:10, de_minimis:1000, duty_note:'Australian GST may apply. These are the buyer\'s responsibility (DDU).', climate_fee:0.40 },
    'INTL':  { zone_name:'INTL',  display_name:'International', currency_code:'USD', currency_symbol:'$', base_shipping_fee:45, free_shipping_threshold:0, vat_rate:0, de_minimis:0, duty_note:'Local import duties & taxes are the buyer\'s responsibility (DDU).', climate_fee:0.30 },
};

// ── Helper: get zone data from Supabase ────────────────────────────────────
const getZoneFromDB = async (zoneName) => {
    if (!supabase) return FALLBACK_ZONES[zoneName] || FALLBACK_ZONES['INTL'];
    const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('zone_name', zoneName)
        .single();
    if (error || !data) return FALLBACK_ZONES[zoneName] || FALLBACK_ZONES['INTL'];
    return data;
};

// @desc  GET /api/geo/zone  — Detect IP and return zone data
const getZoneByIP = async (req, res) => {
    try {
        // 1. Resolve IP (handles proxies and local dev)
        const rawIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
                   || req.socket?.remoteAddress
                   || '';
        const ip = rawIP === '::1' || rawIP === '127.0.0.1' ? '' : rawIP; // blank → ip-api uses requester IP

        // 2. Call ip-api.com (free, no key required)
        const geoURL = ip
            ? `http://ip-api.com/json/${ip}?fields=status,countryCode,country`
            : `http://ip-api.com/json/?fields=status,countryCode,country`;

        const { data: geo } = await axios.get(geoURL, { timeout: 3000 });

        const countryCode = geo.status === 'success' ? geo.countryCode : 'IN';
        const countryName = geo.country || 'India';

        // 3. Resolve zone
        const zoneName = resolveZone(countryCode);

        // 4. Fetch zone data from Supabase
        const zone = await getZoneFromDB(zoneName);

        res.json({
            countryCode,
            countryName,
            zone: {
                ...zone,
                isIndia: zoneName === 'INDIA',
                isInternational: zoneName !== 'INDIA',
            }
        });

    } catch (err) {
        console.error('Geo lookup error:', err.message);
        // Graceful fallback: assume India
        const zone = FALLBACK_ZONES['INDIA'];
        res.json({
            countryCode: 'IN',
            countryName: 'India',
            zone: { ...zone, isIndia: true, isInternational: false }
        });
    }
};

// @desc  GET /api/geo/zones  — Return all zones (admin use)
const getAllZones = async (req, res) => {
    try {
        if (!supabase) return res.json(Object.values(FALLBACK_ZONES));
        const { data, error } = await supabase.from('shipping_zones').select('*').order('zone_name');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.json(Object.values(FALLBACK_ZONES));
    }
};

module.exports = { getZoneByIP, getAllZones };
