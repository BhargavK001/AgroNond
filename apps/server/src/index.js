// Load environment variables FIRST - before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes (these use env vars, so must come after dotenv.config())
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import recordsRouter from './routes/records.js';
import contactRouter from './routes/contact.js';
import adminRouter from './routes/admin.js';
import financeRouter from './routes/finance.js';
import statusRouter from './routes/status.js';
import dailyRatesRouter from './routes/dailyRates.js';
import traderRouter from './routes/trader.js';
import weightRouter from './routes/weight.js';
import searchRouter from './routes/search.js';
import committeeRouter from './routes/committee.js';
import connectDB from './config/db.js';

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces for cloud deployments

// Parse allowed origins from environment (supports comma-separated list)
const getAllowedOrigins = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  // Support comma-separated origins for multi-environment CORS
  return frontendUrl.split(',').map(url => url.trim());
};

// CORS configuration with multiple origin support
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // Logger
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AgroNond Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/records', recordsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);
app.use('/api/finance', financeRouter);
app.use('/api/status', statusRouter);
app.use('/api/daily-rates', dailyRatesRouter);
app.use('/api/trader', traderRouter);
app.use('/api/weight', weightRouter);
app.use('/api/search', searchRouter);
app.use('/api/committee', committeeRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, HOST, () => {
  const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`🚀 AgroNond Server running on http://${displayHost}:${PORT}`);
  console.log(`📡 Health check: http://${displayHost}:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed origins: ${getAllowedOrigins().join(', ')}`);
});
