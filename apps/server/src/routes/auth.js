import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Temporary in-memory OTP store (Use Redis in production)
const otpStore = new Map();

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

/**
 * @desc    Login/Register with Phone
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post('/login', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate Mock OTP
    const otp = '123456';
    // In a real app, generate random 6 digit number

    // Store OTP with expiration (5 minutes)
    otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 });

    console.log(`[MOCK OTP] For ${phone}: ${otp}`);

    // In real app, send SMS via Twilio/Brevo here

    res.status(200).json({
        message: 'OTP sent successfully',
        dev_hint: 'Use 123456 as OTP'
    });
});

/**
 * @desc    Verify OTP and Get Token
 * @route   POST /api/auth/verify
 * @access  Public
 */
router.post('/verify', async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const storedOtpData = otpStore.get(phone);

    if (!storedOtpData) {
        return res.status(400).json({ error: 'No OTP requested for this phone' });
    }

    if (Date.now() > storedOtpData.expires) {
        otpStore.delete(phone);
        return res.status(400).json({ error: 'OTP expired' });
    }

    if (storedOtpData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP Valid
    otpStore.delete(phone); // Clear OTP

    try {
        console.log('[Verify] Checking user for phone:', phone);
        // Check if user exists
        let user = await User.findOne({ phone });
        console.log('[Verify] User found:', user ? user._id : 'No');

        // If not, create new user
        if (!user) {
            console.log('[Verify] Creating new user...');
            user = await User.create({
                phone,
            });
            console.log('[Verify] User created:', user._id);
        }

        // Generate Token
        console.log('[Verify] Generating token...');
        const token = generateToken(user._id);
        console.log('[Verify] Token generated.');

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                phone: user.phone,
                role: user.role,
                full_name: user.full_name
            }
        });

    } catch (error) {
        console.error('Auth Verify Error:', error);
        // Send a simple string if JSON fails
        if (!res.headersSent) {
            res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }
});

/**
 * @desc    Logout (Client side clears token)
 * @route   POST /api/auth/logout
 * @access  Public
 */
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

export default router;
