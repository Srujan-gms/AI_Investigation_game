let isConnected = false;
let mongooseInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || !uri.startsWith('mongodb')) {
    return false;
  }

  try {
    const { default: mongoose } = await import('mongoose');
    mongooseInstance = mongoose;

    // Ready states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      isConnected = true;
      return true;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      bufferCommands: false
    });
    isConnected = true;
    console.log(`[MongoDB Atlas] Successfully connected to cluster: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB] Notice: Could not establish MongoDB connection (${error.message}). Running with resilient in-memory fallback.`);
    isConnected = false;
    return false;
  }
};

export const isDBConnected = () => isConnected;
export const getMongoose = () => mongooseInstance;
