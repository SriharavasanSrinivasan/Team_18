const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '../server/models/User'));
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function findS1Faculty() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_bus_tracking';
        await mongoose.connect(uri);
        
        const faculty = await User.findOne({ assignedBus: 'S1', role: 'faculty' });
        if (faculty) {
            console.log('Found faculty for S1:', faculty.name);
        } else {
            console.log('No faculty found with assignedBus: S1');
            const allFaculty = await User.find({ role: 'faculty' });
            console.log('All faculty assignments:', allFaculty.map(f => ({ name: f.name, bus: f.assignedBus })));
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

findS1Faculty();
