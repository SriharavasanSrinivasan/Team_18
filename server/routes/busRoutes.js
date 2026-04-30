const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/buses/my-bus  — fetch driver's assigned bus details
router.get('/my-bus', protect, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'driver') return res.status(403).json({ message: 'Driver access only' });

        const bus = await Bus.findOne({ busId: req.user.assignedBus, isActive: true });
        if (!bus) return res.status(404).json({ message: 'No active bus assigned to this driver' });

        res.json(bus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/buses  — all buses (faculty + admin)
router.get('/', protect, async (req, res) => {
    try {
        const buses = await Bus.find({ isActive: true });
        console.log(`[DEBUG] GET /api/buses found ${buses.length} active buses`);
        res.json(buses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route POST /api/buses  — create bus (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { busId, routeName, driverName, capacity, stops } = req.body;
        const existing = await Bus.findOne({ busId });
        if (existing)
            return res.status(400).json({ message: 'Bus ID already exists' });

        const bus = await Bus.create({ busId, routeName, driverName, capacity, stops });

        // Link bus to driver if name matches
        if (driverName) {
            await User.findOneAndUpdate(
                { name: { $regex: new RegExp(`^${driverName.trim()}$`, 'i') }, role: 'driver' },
                { assignedBus: busId }
            );
        }

        res.status(201).json(bus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route PUT /api/buses/:id — update bus (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { busId, routeName, driverName, capacity, stops } = req.body;
        
        // If busId is changed, check for uniqueness
        if (busId) {
            const existing = await Bus.findOne({ busId, _id: { $ne: req.params.id } });
            if (existing) {
                return res.status(400).json({ message: 'New Bus ID already exists in the system' });
            }
        }

        const bus = await Bus.findByIdAndUpdate(
            req.params.id,
            { busId, routeName, driverName, capacity, stops },
            { new: true, runValidators: true }
        );

        if (!bus) return res.status(404).json({ message: 'Bus not found' });
        
        // Link bus to driver if name matches
        if (driverName) {
            // 1. Clear previous driver for this bus (only affecting driver roles)
            await User.updateMany({ assignedBus: busId || bus.busId, role: 'driver' }, { assignedBus: null });
            
            // 2. Set new driver
            await User.findOneAndUpdate(
                { name: { $regex: new RegExp(`^${driverName.trim()}$`, 'i') }, role: 'driver' },
                { assignedBus: busId || bus.busId }
            );
        }

        res.json(bus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route DELETE /api/buses/:id  — deactivate bus (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const bus = await Bus.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!bus) return res.status(404).json({ message: 'Bus not found' });

        // Unlink driver (only affecting driver roles)
        await User.updateMany({ assignedBus: bus.busId, role: 'driver' }, { assignedBus: null });

        res.json({ message: 'Bus deactivated', bus });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
