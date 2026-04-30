const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '../server/models/User'));
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkUser() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_bus_tracking';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected to DB');
        
        const faculty = await User.findOne({ role: 'faculty' });
        if (faculty) {
            console.log('Found faculty:', faculty.name, 'ID:', faculty._id);
            console.log('Assigned Bus:', faculty.assignedBus);
            console.log('Schema paths:', Object.keys(User.schema.paths));
        } else {
            console.log('No faculty found. Searching for all users...');
            const allUsers = await User.find().limit(5);
            console.log('Recent users:', allUsers.map(u => ({ name: u.name, role: u.role, id: u._id })));
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUser();
