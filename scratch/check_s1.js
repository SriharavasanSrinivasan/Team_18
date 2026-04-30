const mongoose = require('mongoose');
const path = require('path');
const Bus = require(path.join(__dirname, '../server/models/Bus'));
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkS1() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_bus_tracking';
        await mongoose.connect(uri);
        
        const s1 = await Bus.findOne({ busId: 'S1' });
        console.log('Bus S1 found:', s1 ? 'Yes' : 'No');
        if (s1) {
            console.log('Bus S1 isActive:', s1.isActive);
        }
        
        const allActive = await Bus.find({ isActive: true });
        console.log('Total active buses:', allActive.length);
        console.log('Active IDs:', allActive.map(b => b.busId));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkS1();
