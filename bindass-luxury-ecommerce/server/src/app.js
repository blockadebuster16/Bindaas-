const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');

dotenv.config();

const logger = require('./utils/logger');
const validateEnv = require('./config/validateEnv');

// ── Validate all required env vars at startup (fail-fast) ─────────────────────
validateEnv();

const app = express();

// Initialize Sentry
if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
    app.use(Sentry.Handlers.requestHandler());
}

// 1. Security Headers (helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://checkout.razorpay.com"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https:"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin images etc.
  crossOriginEmbedderPolicy: false
}));

// 2. CORS
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.CLIENT_URL,
      'https://www.bindaas.social',
      'https://bindaas.social'
    ].filter(Boolean)
  : [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5000',
      'http://localhost:5001'
    ].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

app.use(express.json());

// 3. Rate Limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 1000 : 15,
    standardHeaders: true,
    legacyHeaders: false
});

const couponLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false
});

const paymentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false
});

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,
    standardHeaders: true,
    legacyHeaders: false
});

// 4. Database Connection
connectDB();

// 4.5. Initialize Background Workers
require('./config/outboxHandlers').initHandlers();

// 5. Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// 6. Routes
const { cacheControl } = require('./middleware/cache'); // PERF-001: proper SWR caching

app.use('/api/products', cacheControl, require('./routes/productRoutes'));
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/payments', paymentLimiter, require('./routes/paymentRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/advertisements', require('./routes/advertisementRoutes'));
app.use('/api/ai', aiLimiter, require('./routes/aiRoutes'));
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
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/outreach', require('./routes/outreachRoutes'));

// 7. Background workers initialization for Segmentation & Outreach
const { initSegmentationWorker } = require('./services/segmentationWorker');
const { initOutreachDispatcher } = require('./services/outreachDispatcher');
if (process.env.NODE_ENV !== 'test') {
    initSegmentationWorker();
    initOutreachDispatcher();
}

// 8. 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});

// 8. Global Error Handler
if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
}

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