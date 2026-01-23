import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res) => {
  const startTime = Date.now();

  // Default structure
  const status = {
    system: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      memory: process.memoryUsage(),
    },
    services: {
      database: { status: 'unknown', latency: 0, message: '' },
      server: { status: 'healthy', latency: 0 }
    },
    environment: {
      MONGODB_URI: !!process.env.MONGODB_URI,
      BREVO_API_KEY: !!process.env.BREVO_API_KEY,
      FRONTEND_URL: !!process.env.FRONTEND_URL,
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  };

  // Perform a non-blocking DB check
  try {
    const dbStart = Date.now();

    // Check Mongoose connection state
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

    if (state === 1) {
      // Optional: Run a lightweight command (ping)
      await mongoose.connection.db.admin().ping();
      status.services.database.status = 'healthy';
      status.services.database.message = 'Operational';
    } else {
      status.services.database.status = 'offline';
      status.services.database.message = `State: ${state}`;
    }

    status.services.database.latency = Date.now() - dbStart;
  } catch (err) {
    console.warn('Status Check DB Warning:', err.message);
    status.services.database.status = 'offline';
    status.services.database.message = err.message;
  }

  status.services.server.latency = Date.now() - startTime;
  res.json(status);
});

export default router;
