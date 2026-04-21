const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lng: Number,
});

const busSchema = new mongoose.Schema({
    busId: { type: String, required: true, unique: true },
    routeName: { type: String, required: true },
    driverName: { type: String, default: 'Unknown' },
    capacity: { type: Number, default: 50 },
    stops: [stopSchema],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);
