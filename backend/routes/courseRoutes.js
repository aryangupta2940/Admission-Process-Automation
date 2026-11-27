const express = require('express');
const Course = require('../models/Course');

const router = express.Router();

/**
 * GET /api/courses
 * Lists all active admission courses offered by ABESEC Ghaziabad.
 */
router.get('/', async (req, res, next) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ code: 1 }).lean();
    res.json({
      success: true,
      courses,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
