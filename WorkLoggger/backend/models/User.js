const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  auth: [{type: String}], 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
