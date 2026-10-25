import mongoose from 'mongoose';

let isConnected = false;
let memoryStore = {
  users: new Map(),
  mysteries: new Map(),
  sessions: new Map(),
};

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_mystery_room';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB (${error.message}). Operating in High-Performance In-Memory Persistence Mode.`);
    isConnected = false;
  }
};

export const isDBConnected = () => isConnected;
export const getMemoryStore = () => memoryStore;
