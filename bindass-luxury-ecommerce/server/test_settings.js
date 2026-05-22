require('dotenv').config();
const { updateSettings, getSettings } = require('./src/services/supabaseService');

const test = async () => {
    try {
        console.log("Fetching current settings...");
        const current = await getSettings();
        console.log("Current:", current);

        console.log("Attempting to update settings...");
        const result = await updateSettings({
            cgst: 10
        }, 'test@admin.com');
        console.log("Success:", result);
    } catch (e) {
        console.error("Test Failed:");
        console.error(e);
    }
};

test();
