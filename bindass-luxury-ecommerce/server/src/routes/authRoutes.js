const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// @route   POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bindass.com';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'secretadmin123';
        const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback_secret_for_dev';

        // Check if there's any admin set up in the DB
        const adminUsers = await Admin.find({});
        
        let isAuthenticated = false;
        let authEmail = '';

        if (adminUsers.length > 0) {
            // Check Database
            const admin = await Admin.findOne({ email: email.toLowerCase() });
            if (admin && (await admin.matchPassword(password))) {
                isAuthenticated = true;
                authEmail = admin.email;
            }
        } else {
            // Fallback to original ENV credentials if no custom credentials exist yet
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                isAuthenticated = true;
                authEmail = ADMIN_EMAIL;
            }
        }

        if (isAuthenticated) {
            const token = jwt.sign({ id: 'admin-dynamic', role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
            return res.json({
                success: true,
                token,
                admin: { email: authEmail, role: 'admin' }
            });
        }

        res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// @route   POST /api/auth/admin-reset
router.post('/admin-reset', async (req, res) => {
    try {
        const { predefinedEmail, newEmail, newPassword } = req.body;
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bindass.com';

        // Verify the master predefined email
        if (predefinedEmail !== ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Predefined verification email is incorrect.' });
        }

        // Wipe any existing admins and create the new master admin
        await Admin.deleteMany({});
        const admin = await Admin.create({
            email: newEmail,
            password: newPassword
        });

        res.json({ success: true, message: 'Admin credentials successfully updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during reset' });
    }
});

module.exports = router;
