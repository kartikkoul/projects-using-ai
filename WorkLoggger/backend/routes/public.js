const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const WorkItem = require('../models/WorkItem');
const User = require('../models/User');
const auth = require("../middleware/auth");
const userCategories = require("./userCategories");

// Get public work items statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalWorkItems = await WorkItem.countDocuments();
    const completedWorkItems = await WorkItem.countDocuments({ isCompleted: true });
    const totalCategories = await Category.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      totalWorkItems,
      completedWorkItems,
      totalCategories,
      totalUsers,
      completionRate: totalWorkItems ? (completedWorkItems / totalWorkItems * 100).toFixed(1) : 0
    });
  } catch (err) {
    console.error('Error fetching public stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users' data
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const usersWithWorkItems = await Promise.all(users.map(async user => {
      const workItems = await WorkItem.find({ user: user._id });
      return { ...user.toObject(), workItems };
    }));
    res.json(usersWithWorkItems);
  } catch (err) {
    console.error('Error fetching users:', err);
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

router.use('/userCategories', userCategories);

module.exports = router;
