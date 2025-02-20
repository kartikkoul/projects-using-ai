const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const WorkItem = require("../models/WorkItem");
const auth = require("../middleware/auth");

// Get all categories and their work items for a specific user
router.get("/:userId", auth, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.params.userId });
    let categoriesWithWorkItems = await Promise.all(
      categories.map(async (category) => {
        const workItems = await WorkItem.find({
          category: category._id,
        });
        return { ...category.toObject(), workItems };
      })
    );
    
    categoriesWithWorkItems = categoriesWithWorkItems.filter(category => category.workItems.length > 0);
    res.json(categoriesWithWorkItems);
  } catch (err) {
    console.error("Error fetching categories and work items:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
