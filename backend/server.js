require('dotenv').config();
const { connectDB } = require('./config/db');
const { createApp } = require('./app');
const { ensureSeedData } = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required.');
    }

    await connectDB();
    console.log('[DB] Connected to MongoDB successfully.');

    if (process.env.AUTO_SEED !== 'false') {
      await ensureSeedData({ verbose: true });
    }

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[Server] ABESEC Admission Portal running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Startup Error]', err.message);
    process.exit(1);
  }
}

startServer();
