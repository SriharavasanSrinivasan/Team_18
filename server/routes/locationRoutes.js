const express = require('express');
const router = express.Router();
const BusLocation = require('../models/BusLocation');
const Bus = require('../models/Bus');
const { protect } = require('../middleware/auth');
const { calculateETA } = require('../utils/eta');

// @route POST /api/location/update  — receive GPS update (from simulator)
router.post('/update', async (req, res) => {
    try {
        const { busId, latitude, longitude, speed, heading, routeIndex } = req.body;
        const location = await BusLocation.create({
            busId, latitude, longitude,
            speed: speed || 0,
            heading: heading || 0,
            routeIndex: routeIndex || 0,
        });

        // Emit real-time update via socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('locationUpdate', {
                busId, latitude, longitude, speed, heading, routeIndex,
                timestamp: location.timestamp,
            });
        }
        res.status(201).json({ success: true, location });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/location/:busId  — latest location for a bus
router.get('/:busId', protect, async (req, res) => {
    try {
        const location = await BusLocation.findOne({ busId: req.params.busId })
            .sort({ timestamp: -1 });
        if (!location)
            return res.status(404).json({ message: 'No location found for this bus' });
        res.json(location);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/location/all/latest  — latest location of every bus
router.get('/all/latest', protect, async (req, res) => {
    try {
        const buses = await Bus.find({ isActive: true });
        const results = await Promise.all(
            buses.map(async (bus) => {
                const loc = await BusLocation.findOne({ busId: bus.busId }).sort({ timestamp: -1 });
                return { bus, location: loc || null };
            })
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/location/eta/:busId  — ETA from bus to a specific stop
router.get('/eta/:busId', protect, async (req, res) => {
    try {
        const { stopLat, stopLng } = req.query;
        if (!stopLat || !stopLng)
            return res.status(400).json({ message: 'stopLat and stopLng required' });

        const location = await BusLocation.findOne({ busId: req.params.busId })
            .sort({ timestamp: -1 });
        if (!location)
            return res.status(404).json({ message: 'No location found for this bus' });

        const eta = calculateETA(
            location.latitude, location.longitude,
            parseFloat(stopLat), parseFloat(stopLng),
            location.speed
        );
        res.json({ busId: req.params.busId, ...eta });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
