const mongoose = require('mongoose');

const subItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const workItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isCompleted: { type: Boolean, default: false },
  subItems: { type: [subItemSchema], default: [] }, // Ensure subItems is always an array
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field and handle completion date
workItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // If the item is being marked as completed, set the endDate based on the last sub-item's creation date
  if (this.isCompleted) {
    if (this.subItems.length > 0) {
      this.endDate = this.subItems[this.subItems.length - 1].createdAt;
    } else {
      this.endDate = Date.now();
    }
  }
  
  // If the item is being marked as incomplete, clear the endDate
  if (!this.isCompleted && this.endDate) {
    this.endDate = undefined;
  }
  
  next();
});

module.exports = mongoose.model('WorkItem', workItemSchema);
