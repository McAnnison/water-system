const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dailyLogRoutes = require('./routes/dailyLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true
}));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/logs', dailyLogRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SDK Alkaline Water API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: 'Internal server error' });
});

module.exports = app;
