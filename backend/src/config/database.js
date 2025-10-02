// src/config/database.js
import { connect } from 'mongoose';

const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizburst');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;

