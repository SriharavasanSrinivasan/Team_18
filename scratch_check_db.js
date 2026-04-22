const mongoose = require('mongoose');
const TeamMember = require('./server/models/TeamMember');
require('dotenv').config();

async function checkLastMember() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_bus_tracking');
        const member = await TeamMember.findOne().sort({ createdAt: -1 });
        console.log('Last Member Data:', JSON.stringify(member, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkLastMember();
