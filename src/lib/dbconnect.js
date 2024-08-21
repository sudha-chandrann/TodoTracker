import mongoose from 'mongoose';

const connection = {
  isConnected: false,
};

async function dbConnect() {
  // Check if we have a connection to the database or if it's currently connecting
  if (connection.isConnected) {
    console.log('Already connected to the database');
    return;
  }

  try {
    console.log('Connecting to the database...');

    // Use `await mongoose.connect()` directly with the appropriate options
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
    });

    // Set the connection state
    connection.isConnected = mongoose.connection.readyState === 1;

    mongoose.connection.on('connected', () => {
      console.log('Connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      connection.isConnected = false;
    });

    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw new Error('Database connection failed');
  }
}

export default dbConnect;
