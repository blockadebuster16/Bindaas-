const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
// const helmet = require('helmet'); // Suggested addition: npm install helmet

dotenv.config();

const app = express();

// 1. Middleware Configuration
// CORS must be defined BEFORE your routes to allow your React app (Port 3000) to communicate
app.use(cors({
    origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:5000", "https://bindaas-kbb5lsuro-blockadebuster16s-projects.vercel.app/"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));

app.use(express.json()); // Parses incoming JSON requests

// 2. Database Connection Logic
connectDB();

// 3. Health Check (Crucial for Kubernetes Liveness Probes)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.send('Luxury E-commerce API is running...');
});

// 4. Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/advertisements', require('./routes/advertisementRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/geo', require('./routes/geoRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/membership', require('./routes/membershipRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));



// 5. Global Error Handler (Add this at the very end of your routes)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server flying on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});