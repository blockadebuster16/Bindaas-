const jwt = require('jsonwebtoken');

const adminProtect = async (req, res, next) => {
    let token = req.headers.authorization?.startsWith('Bearer ') 
        ? req.headers.authorization.split(' ')[1] 
        : null;

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no admin token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'fallback_secret_for_dev');
        
        // Ensure the token represents the admin identity
        if (decoded.role !== 'admin') {
             return res.status(403).json({ message: "Unauthorized, not an admin" });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Admin Token verification error:", error.message);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

module.exports = { adminProtect };
