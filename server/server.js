const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const seedData = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap';

// Middleware
app.use(cors());
app.use(express.json());

// Chrome devtools probe handler
app.get('/.well-known/*', (req, res) => res.status(204).end());

// Base API route & Health check
app.get(['/', '/api', '/api/health'], (req, res) => {
  res.json({
    success: true,
    message: 'SkillSwap Backend API Server v1.0',
    status: 'Running',
    timestamp: new Date()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ratings', ratingRoutes);

// Catch-all 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Default error handler for consistent format
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Database Connection & Server Start
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB database successfully.');
    // Check if users collection is empty, if so seed default data
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding initial demo users...');
      await seedData();
    }
  })
  .catch(err => {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    console.warn('Backend running in standalone mode (Ensure MongoDB service is started for persistence).');
  });

app.listen(PORT, () => {
  console.log(`🚀 SkillSwap Backend Server running on http://localhost:${PORT}`);
});
