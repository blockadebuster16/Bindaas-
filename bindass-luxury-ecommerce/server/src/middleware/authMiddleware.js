// server/src/middleware/authMiddleware.js (example)
const admin = require('firebase-admin');

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

module.exports = { protect };
