/**
 * Environment Variable Validation
 * Fails fast at startup with a clear message if required env vars are missing.
 * This catches misconfigured deployments immediately, not mysteriously at runtime.
 *
 * Add new required vars to REQUIRED_VARS or OPTIONAL_VARS as needed.
 */
const logger = require('../utils/logger');

const REQUIRED_VARS = [
    'ADMIN_JWT_SECRET',
    'MONGO_URI',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'CUSTOMER_JWT_SECRET',
];

const OPTIONAL_VARS_WITH_DEFAULTS = {
    PORT: '5001',
    NODE_ENV: 'development',
    CLIENT_URL: 'http://localhost:3000',
};

const validateEnv = () => {
    const missing = REQUIRED_VARS.filter(v => !process.env[v]);

    if (missing.length > 0) {
        logger.error(`❌ FATAL: Missing required environment variables:\n  ${missing.join('\n  ')}`);
        logger.error('  Set these in your .env file or Render/Vercel environment settings.');
        process.exit(1);
    }

    // Fill in defaults for optional vars
    Object.entries(OPTIONAL_VARS_WITH_DEFAULTS).forEach(([key, defaultVal]) => {
        if (!process.env[key]) {
            process.env[key] = defaultVal;
            logger.debug(`ℹ️  ${key} not set — using default: ${defaultVal}`);
        }
    });

    logger.info('✅ Environment validation passed.');
};

module.exports = validateEnv;
