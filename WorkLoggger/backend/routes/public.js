const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const WorkItem = require('../models/WorkItem');

// Get public work items statistics
router.get('/stats', async (req, res) => {
  try {
    const totalWorkItems = await WorkItem.countDocuments();
    const completedWorkItems = await WorkItem.countDocuments({ isCompleted: true });
    const totalCategories = await Category.countDocuments();

    res.json({
      totalWorkItems,
      completedWorkItems,
      totalCategories,
      completionRate: totalWorkItems ? (completedWorkItems / totalWorkItems * 100).toFixed(1) : 0
    });
  } catch (err) {
    console.error('Error fetching public stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Version endpoint
router.get('/version', (req, res) => {
  res.json({
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV
  });
});

module.exports = router;
