/**
 * ZONE_MAP — maps ISO country codes to shipping zone names.
 * Keep this in sync with the `zone_name` column in Supabase shipping_zones table.
 * Add more country codes here as you expand markets.
 */
const ZONE_MAP = {
    // ── India ────────────────────────────────────────────────────────────────
    'IN': 'INDIA',

    // ── United States ─────────────────────────────────────────────────────────
    'US': 'USA',

    // ── United Kingdom ────────────────────────────────────────────────────────
    'GB': 'UK',

    // ── European Union ────────────────────────────────────────────────────────
    'DE': 'EU', 'FR': 'EU', 'IT': 'EU', 'ES': 'EU', 'NL': 'EU',
    'BE': 'EU', 'PL': 'EU', 'SE': 'EU', 'AT': 'EU', 'PT': 'EU',
    'GR': 'EU', 'CZ': 'EU', 'HU': 'EU', 'RO': 'EU', 'FI': 'EU',
    'DK': 'EU', 'IE': 'EU', 'SK': 'EU', 'HR': 'EU', 'LU': 'EU',

    // ── UAE ───────────────────────────────────────────────────────────────────
    'AE': 'UAE', 'SA': 'UAE', 'QA': 'UAE', 'KW': 'UAE', 'BH': 'UAE', 'OM': 'UAE',

    // ── South East Asia ───────────────────────────────────────────────────────
    'SG': 'SEA', 'MY': 'SEA', 'TH': 'SEA', 'ID': 'SEA',
    'PH': 'SEA', 'VN': 'SEA', 'MM': 'SEA', 'KH': 'SEA',

    // ── Australia ─────────────────────────────────────────────────────────────
    'AU': 'AUS', 'NZ': 'AUS',
};

/**
 * Resolve a 2-letter ISO country code to a zone key.
 * Falls back to 'INTL' for unmapped countries.
 */
const resolveZone = (countryCode) => {
    if (!countryCode) return 'INTL';
    return ZONE_MAP[countryCode.toUpperCase()] || 'INTL';
};

module.exports = { ZONE_MAP, resolveZone };
