const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ message: "SDK Alkaline Water API is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CEO can now log in at http://localhost:${PORT}/api/auth/login`);
});