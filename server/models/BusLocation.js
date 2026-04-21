const mongoose = require('mongoose');

const busLocationSchema = new mongoose.Schema({
    busId: { type: String, required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: { type: Number, default: 0 },         // km/h
    heading: { type: Number, default: 0 },        // degrees
    routeIndex: { type: Number, default: 0 },     // index in route waypoints
    timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

// TTL: auto-delete location logs older than 1 day
busLocationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('BusLocation', busLocationSchema);
