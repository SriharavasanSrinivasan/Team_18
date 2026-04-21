const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const BusLocation = require('../models/BusLocation');
const User = require('../models/User');
const BusStop = require('../models/BusStop');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/admin/buses — all buses + latest location + delay flag
router.get('/buses', protect, adminOnly, async (req, res) => {
    try {
        const buses = await Bus.find();
        const results = await Promise.all(
            buses.map(async (bus) => {
                const loc = await BusLocation.findOne({ busId: bus.busId }).sort({ timestamp: -1 });
                const now = Date.now();
                const lastSeen = loc ? new Date(loc.timestamp).getTime() : 0;
                const isDelayed = loc ? (now - lastSeen > 2 * 60 * 1000) : true;
                return {
                    bus,
                    location: loc || null,
                    isDelayed,
                    speed: loc ? loc.speed : 0,
                    lastUpdated: loc ? loc.timestamp : null,
                };
            })
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/admin/stats — summary stats
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalBuses = await Bus.countDocuments({ isActive: true });
        const totalLocations = await BusLocation.countDocuments();
        const buses = await Bus.find({ isActive: true });
        let delayCount = 0;
        for (const bus of buses) {
            const loc = await BusLocation.findOne({ busId: bus.busId }).sort({ timestamp: -1 });
            if (!loc || Date.now() - new Date(loc.timestamp).getTime() > 2 * 60 * 1000) delayCount++;
        }
        res.json({ totalBuses, totalLocations, delayCount, activeCount: totalBuses - delayCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/admin/users/:role — get users by role
router.get('/users/:role', protect, adminOnly, async (req, res) => {
    try {
        const { role } = req.params;
        const users = await User.find({ role }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route DELETE /api/admin/users/:id — delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User removed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── BUS STOP ROUTES ──

// @route GET /api/admin/stops — get all bus stops
router.get('/stops', protect, adminOnly, async (req, res) => {
    try {
        const stops = await BusStop.find().sort({ name: 1 });
        res.json(stops);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route POST /api/admin/stops — create new bus stop
router.post('/stops', protect, adminOnly, async (req, res) => {
    try {
        const { name, lat, lng, description } = req.body;
        const exists = await BusStop.findOne({ name });
        if (exists) return res.status(400).json({ message: 'Stop with this name already exists' });

        const stop = await BusStop.create({ name, lat, lng, description });
        res.status(201).json(stop);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route PUT /api/admin/stops/:id — update bus stop
router.put('/stops/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, lat, lng, description } = req.body;
        const stop = await BusStop.findByIdAndUpdate(
            req.params.id,
            { name, lat, lng, description },
            { new: true, runValidators: true }
        );
        if (!stop) return res.status(404).json({ message: 'Stop not found' });
        res.json(stop);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route DELETE /api/admin/stops/:id — delete bus stop
router.delete('/stops/:id', protect, adminOnly, async (req, res) => {
    try {
        const stop = await BusStop.findById(req.params.id);
        if (!stop) return res.status(404).json({ message: 'Stop not found' });
        await BusStop.deleteOne({ _id: req.params.id });
        res.json({ message: 'Bus stop deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
