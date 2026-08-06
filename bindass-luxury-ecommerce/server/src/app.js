const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const logger = require('./utils/logger');
const validateEnv = require('./config/validateEnv');

// ── Validate all required env vars at startup (fail-fast) ─────────────────────
validateEnv();

const app = express();

// 1. Security Headers (helmet)
app.use(helmet({
    // Allow inline scripts for Google Fonts & Razorpay checkout
    contentSecurityPolicy: false
}));

// 2. CORS — must come BEFORE routes
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:5000',
    // NOTE: no trailing slash — browsers send origin without one
    'https://bindaas-kbb5lsuro-blockadebuster16s-projects.vercel.app',
    'https://bindaas.vercel.app',
    'https://www.bindaas.social',
    'https://bindaas.social'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow same-origin / server-to-server calls (no Origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

app.use(express.json());

// 3. Rate Limiters — protect sensitive endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

const couponLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many coupon attempts, please try again later.' }
});

const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many payment requests, please slow down.' }
});

// 4. Database Connection
connectDB();

// 5. Health Check (Kubernetes Liveness Probes)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.send('Luxury E-commerce API is running...');
});

// 6. Routes — apply rate limiters to sensitive endpoints
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/payments', paymentLimiter, require('./routes/paymentRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/advertisements', require('./routes/advertisementRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/coupons', couponLimiter, require('./routes/couponRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/geo', require('./routes/geoRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/membership', require('./routes/membershipRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));
app.use('/api/page-layouts', require('./routes/pageLayoutRoutes'));

// 7. Global Error Handler
app.use((err, req, res, next) => {
    logger.error({ message: err.message, stack: err.stack, path: req.path, method: req.method });
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    logger.info(`🚀 Server flying on port ${PORT} in ${process.env.NODE_ENV} mode`);
});