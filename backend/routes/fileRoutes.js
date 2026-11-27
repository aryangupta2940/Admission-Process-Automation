const express = require('express');
const UploadedFile = require('../models/UploadedFile');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/files/:id
 * Streams an uploaded document from MongoDB if requested by its owner or an admin.
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const file = await UploadedFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    const isOwner = String(file.owner) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this document.',
      });
    }

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.originalName)}"`
    );
    res.setHeader('Content-Length', file.size);
    return res.send(file.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
