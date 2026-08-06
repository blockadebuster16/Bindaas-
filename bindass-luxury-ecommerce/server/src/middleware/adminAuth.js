const jwt = require('jsonwebtoken');

/**
 * ADMIN AUTHENTICATION MIDDLEWARE
 * Protects admin dashboard routes by verifying JWT tokens
 * Uses a separate ADMIN_JWT_SECRET from the customer auth JWT (CUSTOMER_JWT_SECRET)
 * 
 * This middleware is ONLY for admin routes (/api/products, /api/upload, etc)
 * NOT for customer/user authentication (which uses Google Cloud Console OAuth)
 */
const adminProtect = (req, res, next) => {
    let token = req.headers.authorization?.startsWith('Bearer ') 
        ? req.headers.authorization.split(' ')[1] 
        : null;

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Not authorized, no admin token provided" 
        });
    }

    try {
        const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
        if (!JWT_SECRET) {
            console.error('ADMIN_JWT_SECRET is not configured');
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Ensure the token represents the admin identity
        if (decoded.role !== 'admin') {
             return res.status(403).json({ 
                 success: false,
                 message: "Unauthorized, not an admin" 
             });
        }

        // Attach admin info to request
        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Admin Token verification error:", error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Token expired, please login again" 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            message: "Not authorized, token invalid" 
        });
    }
};

module.exports = { adminProtect };
