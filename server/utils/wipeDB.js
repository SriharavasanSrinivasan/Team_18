require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Bus = require('../models/Bus');
const BusStop = require('../models/BusStop');
const TeamMember = require('../models/TeamMember');

const clearAllData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to:', process.env.MONGO_URI);

        console.log('Wiping all data...');
        
        // Delete all except the system admin
        await User.deleteMany({ email: { $ne: 'admin@college.edu' } });
        await Bus.deleteMany({});
        await BusStop.deleteMany({});
        await TeamMember.deleteMany({});

        console.log('✅ All data wiped successfully (except Admin)');
        
        // Ensure admin password is reset to 'admin' just in case
        const admin = await User.findOne({ email: 'admin@college.edu' });
        if (admin) {
            admin.password = 'admin';
            await admin.save();
            console.log('✅ Admin password verified as "admin"');
        } else {
            await User.create({
                name: 'System Admin',
                email: 'admin@college.edu',
                password: 'admin',
                role: 'admin'
            });
            console.log('✅ Admin account re-created');
        }

        process.exit();
    } catch (err) {
        console.error('Wipe error:', err);
        process.exit(1);
    }
};

clearAllData();
