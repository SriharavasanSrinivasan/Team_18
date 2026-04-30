const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '../server/models/User'));
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function listAdmins() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_bus_tracking';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log('Connected!');
        
        const admins = await User.find({ role: 'admin' });
        console.log('Admin Users Found:', admins.length);
        admins.forEach(a => {
            console.log(`- ${a.name} (${a.email})`);
        });
        
        const mainAdmin = await User.findOne({ email: 'admin@college.edu' });
        if (mainAdmin) {
            mainAdmin.password = 'admin';
            await mainAdmin.save();
            console.log('✅ Main Admin password reset to: admin');
        } else {
            await User.create({
                name: 'System Admin',
                email: 'admin@college.edu',
                password: 'admin',
                role: 'admin'
            });
            console.log('✅ Main Admin created: admin@college.edu / admin');
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

listAdmins();
