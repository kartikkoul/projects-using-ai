const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WorkItem = require('../models/WorkItem');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Get all users
router.get('/users', [auth, isAdmin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete user and all their data
router.delete('/users/:id', [auth, isAdmin], async (req, res) => {
  try {
    // Delete user's work items
    await WorkItem.deleteMany({ user: req.params.id });
    // Delete user's categories
    await Category.deleteMany({ user: req.params.id });
    // Delete user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'User and associated data deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
