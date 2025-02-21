const express = require('express');
const router = express.Router();
const WorkItem = require('../models/WorkItem');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateWorkItem = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').optional().trim(),
  body('subItems.*.description').optional().trim().notEmpty()
    .withMessage('Sub-item description cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date')
];

// Get all work items for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.user.userId };
    
    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const workItems = await WorkItem.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(workItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message:"Server error", error:err.message || err});
  }
});

// Get a single work item
router.get('/:id', auth, async (req, res) => {
  try {
    const workItem = await WorkItem.findById(req.params.id).populate('category', 'name');
    if (!workItem) return res.status(404).json({ msg: 'Work item not found' });
    
    if (workItem.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(workItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message:"Server error", error:err.message || err});
  }
});

// Create a new work item
router.post('/', [auth, validateWorkItem], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newWorkItem = new WorkItem({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      isCompleted: req.body.isCompleted,
      user: req.user.userId,
      subItems: req.body.subItems || [], // Ensure subItems is an array
      startDate: req.body.startDate,
      endDate: req.body.endDate
    });



    const workItem = await newWorkItem.save();
    await workItem.populate('category', 'name');
    res.json(workItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message:"Server error", error:err.message || err});
  }
});

// Update a work item
router.put('/:id', [auth, validateWorkItem], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let workItem = await WorkItem.findById(req.params.id);
    if (!workItem) return res.status(404).json({ msg: 'Work item not found' });

    if (workItem.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }


    const updateData = {
      title: req.body.title,
      description: req.body.description,
      isCompleted: req.body.isCompleted,
      endDate: req.body.isCompleted && workItem.subItems.length > 0 ? workItem.subItems[workItem.subItems.length - 1].createdAt : workItem.endDate,
      updatedAt: Date.now()
    };

    workItem = await WorkItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name');


    res.json(workItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message:"Server error", error:err.message || err});
  }
});

// Add a sub-item to a work item
router.post('/:id/subitems', [auth, 
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const workItem = await WorkItem.findById(req.params.id);
    if (!workItem) return res.status(404).json({ msg: 'Work item not found' });

    if (workItem.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const newSubItem = {
      description: req.body.description,
      createdAt: Date.now()
    };

    workItem.subItems.push(newSubItem);
    await workItem.save();
    await workItem.populate('category', 'name');

    res.json(workItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: "Server error", error: err.message || err});
  }
});

// Update a sub-item
router.put('/:id/subitems/:subItemId', [auth,
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const workItem = await WorkItem.findById(req.params.id);
    if (!workItem) return res.status(404).json({ msg: 'Work item not found' });

    if (workItem.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const subItem = workItem.subItems.id(req.params.subItemId);
    if (!subItem) return res.status(404).json({ msg: 'Sub-item not found' });

    subItem.description = req.body.description;
    await workItem.save();
    await workItem.populate('category', 'name');

    res.json(workItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: "Server error", error: err.message || err});
  }
});

// Delete a sub-item
router.delete('/:id/subitems/:subItemId', auth, async (req, res) => {
  try {
    const workItem = await WorkItem.findById(req.params.id);
    if (!workItem) return res.status(404).json({ msg: 'Work item not found' });

    if (workItem.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const subItemIndex = workItem.subItems.findIndex(subItem => subItem._id.toString() === req.params.subItemId);
    if (subItemIndex === -1) return res.status(404).json({ msg: 'Sub-item not found' });

    workItem.subItems.splice(subItemIndex, 1);
    await workItem.save();
    await workItem.populate('category', 'name');

    res.json(workItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: "Server error", error: err.message || err});
  }
});

// Delete a work item
router.delete('/:id', auth, async (req, res) => {
  try {
    const workItem = await WorkItem.findById(req.params.id);
    if (!workItem) return res.status(404).json({ msg: 'Work item not found' });

    if (workItem.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await WorkItem.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Work item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message:"Server error", error:err.message || err});
  }
});

module.exports = router;
