const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// ─── CORS Configuration ────────────────────────────────────────────────────
// CLIENT_URL must be set in Render environment variables to your Vercel URL.
// Example: https://bindaas-sigma.vercel.app  (no trailing slash)
const allowedOrigins = [
    process.env.CLIENT_URL,                          // Production Vercel URL (set in Render env vars)
    'http://localhost:3000',                          // Local React dev server
    'http://localhost:5001',                          // Local backend (for same-origin testing)
].filter(Boolean); // Remove undefined/null entries if CLIENT_URL is not set

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (server-to-server, curl, Render health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Also allow any *.vercel.app subdomain (covers preview deployments)
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        console.warn(`CORS blocked request from origin: ${origin}`);
        return callback(new Error(`CORS policy: origin ${origin} not allowed`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());

// ─── Database ───────────────────────────────────────────────────────────
connectDB();

// ─── Health / Root ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.send('Luxury E-commerce API is running...');
});

// ─── Routes ────────────────────────────────────────────────────────────
app.use('/api/products',       require('./routes/productRoutes'));
app.use('/api/auth',           require('./routes/authRoutes'));
app.use('/api/payments',       require('./routes/paymentRoutes'));
app.use('/api/cart',           require('./routes/cartRoutes'));
app.use('/api/upload',         require('./routes/uploadRoutes'));
app.use('/api/orders',         require('./routes/orderRoutes'));
app.use('/api/advertisements', require('./routes/advertisementRoutes'));
app.use('/api/ai',             require('./routes/aiRoutes'));
app.use('/api/users',          require('./routes/userRoutes'));
app.use('/api/wishlist',       require('./routes/wishlistRoutes'));
app.use('/api/coupons',        require('./routes/couponRoutes'));
app.use('/api/reviews',        require('./routes/reviewRoutes'));
app.use('/api/settings',       require('./routes/settingsRoutes'));
app.use('/api/geo',            require('./routes/geoRoutes'));
app.use('/api/analytics',      require('./routes/analyticsRoutes'));
app.use('/api/membership',     require('./routes/membershipRoutes'));
app.use('/api/forms',          require('./routes/formRoutes'));

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`✅ Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});
