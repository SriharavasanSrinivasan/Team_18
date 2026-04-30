const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '../server/models/User'));
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkUserById() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_bus_tracking';
        await mongoose.connect(uri);
        
        const id = '69f0b5844ebc80802b28810a';
        const user = await User.findById(id);
        if (user) {
            console.log('User found by ID:', user.name);
        } else {
            console.log('User NOT found by ID:', id);
            // Try searching by string id if it's stored differently
            const userStr = await User.findOne({ _id: id });
            console.log('User found by findOne(_id):', userStr ? 'Yes' : 'No');
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUserById();
