const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Utility function to get JWT secret
const getJWTSecret = () => process.env.ADMIN_JWT_SECRET || 'fallback_secret_for_dev';

// @route   POST /api/auth/admin-login
// Admin Dashboard Login (NOT Customer Login)
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bindass.com';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'secretadmin123';
        const JWT_SECRET = getJWTSecret();

        // Check if there's any admin set up in the DB
        const adminUsers = await Admin.find({});
        
        let isAuthenticated = false;
        let authEmail = '';

        if (adminUsers.length > 0) {
            // Check Database for custom admin credentials
            const admin = await Admin.findOne({ email: email.toLowerCase() });
            if (admin && (await admin.matchPassword(password))) {
                isAuthenticated = true;
                authEmail = admin.email;
            }
        } else {
            // Fallback to ENV credentials if no custom admin exists yet
            if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
                isAuthenticated = true;
                authEmail = ADMIN_EMAIL;
            }
        }

        if (isAuthenticated) {
            const token = jwt.sign(
                { id: 'admin-dynamic', role: 'admin', email: authEmail }, 
                JWT_SECRET, 
                { expiresIn: '8h' }
            );
            return res.json({
                success: true,
                token,
                admin: { email: authEmail, role: 'admin' }
            });
        }

        res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// @route   POST /api/auth/admin-reset
// Reset/Setup Admin Credentials
router.post('/admin-reset', async (req, res) => {
    try {
        const { predefinedEmail, newEmail, newPassword } = req.body;

        // Input validation
        if (!predefinedEmail || !newEmail || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }

        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bindass.com';

        // Verify the master predefined email matches env variable
        if (predefinedEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized: Predefined verification email is incorrect.' 
            });
        }

        // Wipe any existing admins and create the new master admin
        await Admin.deleteMany({});
        const admin = await Admin.create({
            email: newEmail.toLowerCase(),
            password: newPassword
        });

        res.json({ 
            success: true, 
            message: 'Admin credentials successfully updated.',
            admin: { email: admin.email, role: 'admin' }
        });
    } catch (error) {
        console.error('Admin reset error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Server error during reset' 
        });
    }
});

module.exports = router;
