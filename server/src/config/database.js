import mongoose from 'mongoose';

// Set mongoose options globally
mongoose.set('bufferTimeoutMS', 30000);
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    // Set connection timeout to 30 seconds and disable buffering
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Set up TTL index for messages (auto-delete after 30 days)
    const messagesCollection = conn.connection.collection('messages');
    await messagesCollection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 2592000 } // 30 days
    );

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Server will continue running, but database features will not work.');
    console.log('💡 Please check:');
    console.log('   1. MongoDB connection string is correct');
    console.log('   2. Your IP address is whitelisted in MongoDB Atlas');
    console.log('   3. Network/firewall allows MongoDB connection');
    // Don't exit - let server run without DB
  }
};

export default connectDB;
