const mongoose = require('mongoose');

const familyDetailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fatherName: {
    type: String,
    required: true,
    trim: true
  },
  motherName: {
    type: String,
    required: true,
    trim: true
  },
  siblings: {
    brothers: { type: Number, min: 0, default: 0 },
    sisters: { type: Number, min: 0, default: 0 }
  },
  familyType: {
    type: String,
    enum: ['Nuclear', 'Joint', 'Extended'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('familyDetail', familyDetailSchema);
