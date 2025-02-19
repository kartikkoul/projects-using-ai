const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim()
];

// Get all categories for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.userId });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new category
router.post('/', [auth, validateCategory], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newCategory = new Category({
      name: req.body.name,
      description: req.body.description,
      user: req.user.userId
    });


    const category = await newCategory.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server Error', error: err.message || err});
  }
});

// Update a category
router.put('/:id', [auth, validateCategory], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    // Make sure user owns category
    if (category.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { 
        name: req.body.name,
        description: req.body.description
      },
      { new: true }
    );

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a category
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    // Make sure user owns category
    if (category.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Category.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
