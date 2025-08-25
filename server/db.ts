import mongoose from 'mongoose';

export async function connectDatabase() {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!mongoUrl) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}
