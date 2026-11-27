const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      default: '4 Years',
    },
    eligibility: {
      type: String,
      default: '10+2 with minimum 50% marks',
    },
    totalSeats: {
      type: Number,
      default: 120,
      min: 1,
    },
    annualFee: {
      type: Number,
      default: 135000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
