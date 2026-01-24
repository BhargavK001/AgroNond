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
import connectDB from './config/db.js';

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(morgan('dev')); // Logger
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
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
app.listen(PORT, () => {
  console.log(`🚀 AgroNond Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
