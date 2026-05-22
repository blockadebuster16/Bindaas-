// server/src/middleware/authMiddleware.js
const admin = require('../config/firebase');
const jwt = require('jsonwebtoken');

// ── Customer / Firebase protection ────────────────────────────────────────
const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(403).json({ message: "Unauthorized access" });
    }
};

// ── Admin JWT protection (used by admin dashboard) ─────────────────────────
const protectAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        return res.status(403).json({ message: "No admin token provided" });
    }

    try {
        const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback_secret_for_dev';
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Admin role required" });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Unauthorized access" });
    }
};

module.exports = { protect, protectAdmin };
