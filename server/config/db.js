const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_bus_tracking';

    // Try connecting to the primary URI first
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000 // Wait up to 3 seconds before falling back
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.log(`⚠️ Local MongoDB service not detected on ${uri}`);
      console.log(`🚀 Starting fallback In-Memory Database...`);
      
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      console.log(`📝 Note: Data is temporary and will reset on server restart.`);
    }
  } catch (error) {
    console.error(`❌ Global MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
