const express = require('express');
const Application = require('../models/Application');
const Course = require('../models/Course');
const UploadedFile = require('../models/UploadedFile');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { applicationUploadFields } = require('../middleware/upload');
const { generateApplicationNumber } = require('../utils/generateAppId');
const { validateApplicationInput } = require('../utils/validators');

const router = express.Router();

const DOC_FIELDS = ['photograph', 'tenthMarksheet', 'twelfthMarksheet', 'identityProof'];

/**
 * Saves uploaded files from multer memoryStorage into MongoDB UploadedFile collection.
 */
async function persistUploadedFiles(files, ownerId, applicationId = null) {
  const savedDocs = {};
  const createdFileIds = [];

  for (const field of DOC_FIELDS) {
    const fileArr = files && files[field];
    if (fileArr && fileArr.length > 0) {
      const f = fileArr[0];
      const doc = await UploadedFile.create({
        owner: ownerId,
        application: applicationId,
        docType: field,
        originalName: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
        data: f.buffer,
      });
      createdFileIds.push(doc._id);
      savedDocs[field] = {
        fileId: doc._id,
        fileName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        uploadedAt: doc.createdAt,
      };
    }
  }

  return { savedDocs, createdFileIds };
}

/**
 * GET /api/applications/me
 * Returns the logged-in student's application (or null if not submitted yet).
 */
router.get('/me', protect, authorize('student'), async (req, res, next) => {
  try {
    const application = await Application.findOne({ student: req.user._id }).lean();
    res.json({
      success: true,
      application: application || null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/applications
 * Submits a new admission application with personal, academic, and 4 required documents.
 */
router.post(
  '/',
  protect,
  authorize('student'),
  applicationUploadFields,
  async (req, res, next) => {
    let createdFileIds = [];
    try {
      const existing = await Application.findOne({ student: req.user._id });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'You have already submitted an admission application. You can view or edit it if permitted.',
        });
      }

      const errors = validateApplicationInput(req.body);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors[0],
          errors,
        });
      }

      // Ensure all 4 required documents are uploaded
      const missingDocs = DOC_FIELDS.filter(
        (field) => !req.files || !req.files[field] || req.files[field].length === 0
      );
      if (missingDocs.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required documents: ${missingDocs.join(', ')}`,
        });
      }

      const selectedCourse = await Course.findOne({
        $or: [{ name: req.body.course.trim() }, { code: req.body.course.trim() }],
      }).lean();

      const applicationNumber = await generateApplicationNumber();
      const { savedDocs, createdFileIds: fileIds } = await persistUploadedFiles(
        req.files,
        req.user._id
      );
      createdFileIds = fileIds;

      const application = await Application.create({
        applicationNumber,
        student: req.user._id,
        personalInfo: {
          fullName: req.body.fullName.trim(),
          email: req.body.email.trim().toLowerCase(),
          phone: req.body.phone.trim(),
          dateOfBirth: new Date(req.body.dateOfBirth),
          gender: req.body.gender,
          address: req.body.address.trim(),
          city: (req.body.city || '').trim(),
          state: (req.body.state || '').trim(),
          pincode: (req.body.pincode || '').trim(),
        },
        academicInfo: {
          tenthPercentage: Number(req.body.tenthPercentage),
          twelfthPercentage: Number(req.body.twelfthPercentage),
          previousSchool: req.body.previousSchool.trim(),
          course: selectedCourse ? selectedCourse.name : req.body.course.trim(),
          courseCode: selectedCourse ? selectedCourse.code : '',
        },
        documents: savedDocs,
        status: 'Pending',
        submittedAt: new Date(),
        statusHistory: [
          {
            status: 'Pending',
            remark: 'Application submitted by student.',
            changedBy: req.user._id,
            changedByName: req.user.name,
            changedAt: new Date(),
          },
        ],
      });

      // Back-link uploaded files to application
      await UploadedFile.updateMany(
        { _id: { $in: createdFileIds } },
        { $set: { application: application._id } }
      );

      await Notification.create({
        user: req.user._id,
        application: application._id,
        title: `Application Submitted (${application.applicationNumber})`,
        message: `Your admission application for ${application.academicInfo.course} has been submitted and is currently Pending review.`,
        type: 'success',
      });

      return res.status(201).json({
        success: true,
        message: 'Admission application submitted successfully.',
        application,
      });
    } catch (err) {
      if (createdFileIds.length > 0) {
        await UploadedFile.deleteMany({ _id: { $in: createdFileIds } }).catch(() => {});
      }
      next(err);
    }
  }
);

/**
 * PUT /api/applications/me
 * Allows a student to edit their application ONLY while its status is 'Pending'.
 */
router.put(
  '/me',
  protect,
  authorize('student'),
  applicationUploadFields,
  async (req, res, next) => {
    let newlyCreatedFileIds = [];
    try {
      const application = await Application.findOne({ student: req.user._id });
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'No existing application found to update.',
        });
      }

      if (application.status !== 'Pending') {
        return res.status(403).json({
          success: false,
          message: `Editing is locked because your application status is "${application.status}".`,
        });
      }

      const errors = validateApplicationInput(req.body);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors[0],
          errors,
        });
      }

      const selectedCourse = await Course.findOne({
        $or: [{ name: req.body.course.trim() }, { code: req.body.course.trim() }],
      }).lean();

      const { savedDocs, createdFileIds } = await persistUploadedFiles(
        req.files,
        req.user._id,
        application._id
      );
      newlyCreatedFileIds = createdFileIds;

      const oldFileIdsToDelete = [];
      for (const field of DOC_FIELDS) {
        if (savedDocs[field]) {
          if (application.documents[field] && application.documents[field].fileId) {
            oldFileIdsToDelete.push(application.documents[field].fileId);
          }
          application.documents[field] = savedDocs[field];
        }
      }

      application.personalInfo = {
        fullName: req.body.fullName.trim(),
        email: req.body.email.trim().toLowerCase(),
        phone: req.body.phone.trim(),
        dateOfBirth: new Date(req.body.dateOfBirth),
        gender: req.body.gender,
        address: req.body.address.trim(),
        city: (req.body.city || '').trim(),
        state: (req.body.state || '').trim(),
        pincode: (req.body.pincode || '').trim(),
      };

      application.academicInfo = {
        tenthPercentage: Number(req.body.tenthPercentage),
        twelfthPercentage: Number(req.body.twelfthPercentage),
        previousSchool: req.body.previousSchool.trim(),
        course: selectedCourse ? selectedCourse.name : req.body.course.trim(),
        courseCode: selectedCourse ? selectedCourse.code : '',
      };

      application.statusHistory.push({
        status: application.status,
        remark: 'Application details updated by student.',
        changedBy: req.user._id,
        changedByName: req.user.name,
        changedAt: new Date(),
      });

      await application.save();

      if (oldFileIdsToDelete.length > 0) {
        await UploadedFile.deleteMany({ _id: { $in: oldFileIdsToDelete } }).catch(() => {});
      }

      await Notification.create({
        user: req.user._id,
        application: application._id,
        title: `Application Updated (${application.applicationNumber})`,
        message: 'Your admission application details have been updated successfully.',
        type: 'info',
      });

      return res.json({
        success: true,
        message: 'Application updated successfully.',
        application,
      });
    } catch (err) {
      if (newlyCreatedFileIds.length > 0) {
        await UploadedFile.deleteMany({ _id: { $in: newlyCreatedFileIds } }).catch(() => {});
      }
      next(err);
    }
  }
);

module.exports = router;
