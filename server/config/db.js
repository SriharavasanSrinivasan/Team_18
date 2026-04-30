const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_bus_tracking';
    console.log('🔍 Attempting to connect to:', uri.replace(/:([^:@]+)@/, ':****@')); // mask password in logs

    const isProduction = process.env.NODE_ENV === 'production';

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);

        if (isProduction) {
            // In production, never fall back to in-memory — crash early so Render shows a clear error
            console.error('🚨 Cannot start server without a database in production. Check MONGO_URI env var.');
            process.exit(1);
        }

        // Local development only: fall back to in-memory MongoDB
        console.log('🔄 Trying fallback to In-Memory MongoDB (dev only)...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const fallbackUri = mongoServer.getUri();
            console.log('🔍 Connecting to In-Memory DB at:', fallbackUri);
            await mongoose.connect(fallbackUri);
            console.log('✅ In-Memory MongoDB Connected (data will reset on restart)');
        } catch (memErr) {
            console.error('❌ In-Memory MongoDB also failed:', memErr.message);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
