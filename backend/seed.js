require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const { ensureSeedData } = require('./utils/seedData');

async function runSeed() {
  try {
    await connectDB();
    console.log('[Seed] Connected to MongoDB.');
    await ensureSeedData({ verbose: true });
    console.log('[Seed] Courses and demo accounts verified/seeded successfully.');
  } catch (err) {
    console.error('[Seed Error]', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runSeed();
