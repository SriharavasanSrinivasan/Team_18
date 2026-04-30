const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_bus_tracking';
    console.log('🔍 Attempting to connect to:', uri);

    try {
      // Set a strict timeout for the connection attempt
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
      console.log('⚠️ Local MongoDB connection failed:', err.message);
      console.log('🔄 Trying fallback to In-Memory MongoDB...');
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const fallbackUri = mongoServer.getUri();
      
      console.log('🔍 Connecting to In-Memory DB at:', fallbackUri);
      await mongoose.connect(fallbackUri);
      console.log('✅ In-Memory MongoDB Connected');
    }
  } catch (error) {
    console.error('❌ Global MongoDB Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
