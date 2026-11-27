const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGO_URI.
 * Fails fast if MONGO_URI is missing in non-test environments.
 */
async function connectDB(uriOverride) {
  const uri = uriOverride || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not defined.');
  }

  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  return conn;
}

module.exports = { connectDB };
