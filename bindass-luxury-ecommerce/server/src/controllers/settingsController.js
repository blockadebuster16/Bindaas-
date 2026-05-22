const { getSettings: getSupabaseSettings, updateSettings: updateSupabaseSettings } = require('../services/supabaseService');

// @desc  Get all store settings (public — used by checkout)
// @route GET /api/settings
const getSettings = async (req, res) => {
  try {
    const settings = await getSupabaseSettings();
    res.json(settings);
  } catch (err) {
    console.error('getSettings error:', err);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

// @desc  Update store settings (admin only)
// @route PATCH /api/settings
const updateSettings = async (req, res) => {
  try {
    const allowed = [
      'cgst', 'sgst', 'shippingGst',
      'airRate', 'surfaceRate',
      'codFee', 'codEnabled',
      'itemWeight', 'unitWeight',
      'freeShippingThreshold',
      'climateFeeEnabled', 'climateFeeAmount', 'climateFeeCause'
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const adminEmail = req.admin?.email || 'admin@system';
    const settings = await updateSupabaseSettings(updates, adminEmail);

    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    console.error('updateSettings error:', err);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

module.exports = { getSettings, updateSettings };
