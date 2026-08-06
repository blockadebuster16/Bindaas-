const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const User = require('../models/User');
const oauth2Client = require('../config/google-auth');

// Utilities
const getAdminJWTSecret = () => process.env.ADMIN_JWT_SECRET || 'fallback_secret_for_dev';
const getCustomerJWTSecret = () => process.env.CUSTOMER_JWT_SECRET;

// ── GOOGLE OAUTH Step 1: Redirect to Google consent ──────────────────────────
router.get('/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
        prompt: 'select_account',
    });
    res.redirect(url);
});

// ── GOOGLE OAUTH Step 2: Handle callback, issue JWT ───────────────────────────
router.get('/google/callback', async (req, res) => {
    const { code, error } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (error) {
        console.error('Google OAuth error:', error);
        return res.redirect(`${clientUrl}/auth/callback?error=google_auth_failed`);
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const { google } = require('googleapis');
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: googleUser } = await oauth2.userinfo.get();
        const { id: googleUID, email, name, picture } = googleUser;

        let user = await User.findOne({ googleUID });
        if (!user) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
                user.googleUID = googleUID;
                user.picture = picture;
                await user.save();
            } else {
                user = await User.create({
                    googleUID,
                    email: email.toLowerCase(),
                    displayName: name || 'Value Member',
                    picture,
                    authProvider: 'google',
                });
            }
        }

        const token = jwt.sign(
            { uid: googleUID, email, name: name || user.displayName, picture, provider: 'google' },
            getCustomerJWTSecret(),
            { expiresIn: '7d' }
        );

        res.redirect(`${clientUrl}/auth/callback?token=${token}`);
    } catch (err) {
        console.error('Google OAuth callback error:', err);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/auth/callback?error=server_error`);
    }
});

// ── CUSTOMER REGISTER (email/password) ────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, mobile, birthdate, gender } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Value Member';

        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            displayName,
            phoneNumber: mobile,
            authProvider: 'email',
        });

        const token = jwt.sign(
            { uid: user._id.toString(), email: user.email, name: user.displayName, provider: 'email' },
            getCustomerJWTSecret(),
            { expiresIn: '7d' }
        );

        res.status(201).json({ success: true, token, user: { email: user.email, name: user.displayName } });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

// ── CUSTOMER LOGIN (email/password) ───────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase(), authProvider: 'email' }).select('+password');
        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { uid: user._id.toString(), email: user.email, name: user.displayName, provider: 'email' },
            getCustomerJWTSecret(),
            { expiresIn: '7d' }
        );

        res.json({ success: true, token, user: { email: user.email, name: user.displayName } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// ── VERIFY TOKEN (session restore on page refresh) ────────────────────────────
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    try {
        const decoded = jwt.verify(token, getCustomerJWTSecret());
        res.json({ success: true, user: decoded });
    } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
});

// ── ADMIN LOGIN ────────────────────────────────────────────────────────────────
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bindaas.com';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'secretadmin123';
        const JWT_SECRET = getAdminJWTSecret();

        // 1. Try Database Admin
        const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
        if (admin && (await admin.matchPassword(password))) {
            isAuthenticated = true;
            authEmail = admin.email;
        } 
        
        // 2. Try Master ENV Admin (Fallback)
        if (!isAuthenticated && email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() && password === ADMIN_PASSWORD) {
            isAuthenticated = true;
            authEmail = ADMIN_EMAIL;
        }

        if (isAuthenticated) {
            const token = jwt.sign(
                { id: 'admin-dynamic', role: 'admin', email: authEmail },
                JWT_SECRET,
                { expiresIn: '8h' }
            );
            return res.json({ success: true, token, admin: { email: authEmail, role: 'admin' } });
        }

        res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// ── ADMIN RESET ────────────────────────────────────────────────────────────────
router.post('/admin-reset', async (req, res) => {
    try {
        const { predefinedEmail, newEmail, newPassword } = req.body;

        if (!predefinedEmail || !newEmail || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bindaas.com';
        if (predefinedEmail.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
            return res.status(403).json({ success: false, message: `Unauthorized: Predefined verification email is incorrect. Expected: ${ADMIN_EMAIL}` });
        }

        await Admin.deleteMany({});
        const admin = await Admin.create({ email: newEmail.toLowerCase().trim(), password: newPassword });

        res.json({ success: true, message: 'Admin credentials successfully updated.', admin: { email: admin.email, role: 'admin' } });
    } catch (error) {
        console.error('Admin reset error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error during reset' });
    }
});

module.exports = router;
