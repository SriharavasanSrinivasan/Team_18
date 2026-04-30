const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route POST /api/auth/register
router.post('/register', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, password, role, assignedBus, boardingStop } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'All fields required' });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, role: role || 'faculty', assignedBus, boardingStop });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            assignedBus: user.assignedBus,
            boardingStop: user.boardingStop,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            assignedBus: user.assignedBus,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
    res.json(req.user);
});

// @route POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
