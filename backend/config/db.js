// config/db.js
import mongoose from 'mongoose';

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/find-tutor';

const connectToMongo = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(dbUrl);
    console.log('✅ DATABASE CONNECTED');
  } catch (error) {
    console.error('❌ DATABASE CONNECTION ERROR:', error.message);
    process.exit(1); // Optional: Exit process on DB failure
  }
};

export default connectToMongo;
