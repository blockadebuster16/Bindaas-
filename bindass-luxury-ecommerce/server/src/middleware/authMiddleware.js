// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// ── Customer protection (Google OAuth + Email/Password JWT) ───────────────────
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET;
        if (!CUSTOMER_JWT_SECRET) {
            console.error('CUSTOMER_JWT_SECRET is not configured');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET);

        // Normalise: expose decoded.sub or decoded.uid as req.user.uid
        // so all controllers (userController, reviewController, etc.) work unchanged
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
            provider: decoded.provider,
        };

        next();
    } catch (error) {
        console.error('Customer token verification error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired, please sign in again' });
        }

        return res.status(403).json({ message: 'Unauthorized access' });
    }
};

// ── Admin JWT protection (admin dashboard — unchanged) ─────────────────────────
const protectAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No admin token provided' });
    }

    try {
        const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
        if (!JWT_SECRET) {
            console.error('ADMIN_JWT_SECRET is not configured');
            return res.status(500).json({ message: 'Server configuration error' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin role required' });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
};

module.exports = { protect, protectAdmin };
