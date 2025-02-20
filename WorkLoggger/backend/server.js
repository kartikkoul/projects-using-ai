// Load env vars - this must be the first line
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');
const workItemRoutes = require('./routes/workItems');
const publicRoutes = require('./routes/public');
const aiRoutes = require('./routes/ai');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/worklogger', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Routes
app.use('/api/public', publicRoutes);  // Add this before protected routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/workitems', workItemRoutes);
app.use('/api/ai', aiRoutes);  // Add the AI route

// Remove the existing favicon handler and add this instead
app.use(express.static(path.join(__dirname, 'public')));

// Specific API error handling
app.use('/api', (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// All other requests go to index.html
app.get('*', (req, res) => {
  res.sendStatus(404);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Work Logger API is running' });
});

// Handle favicon.ico request
app.get('/favicon.ico', (req, res) => {
  res.sendStatus(204);
});

// Error handling for static files
app.use((req, res, next) => {
  if (req.path.includes('static')) {
    return res.status(404).send('Not found');
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
