require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { seedUsers, seedBusData, seedTeamMembers } = require('./seeder');

const runSeeder = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Running seeder with new data...');
        await seedUsers();
        await seedBusData();
        await seedTeamMembers();
        
        console.log('✅ Seeding complete');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

runSeeder();
