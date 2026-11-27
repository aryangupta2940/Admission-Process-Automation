const express = require('express');
const User = require('../models/User');
const Application = require('../models/Application');
const UploadedFile = require('../models/UploadedFile');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes
router.use(protect, authorize('admin'));

/**
 * GET /api/admin/stats
 * Returns dashboard statistics, course breakdown, and recent applications.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalApplications,
      pendingApplications,
      underReviewApplications,
      approvedApplications,
      rejectedApplications,
      courseBreakdown,
      recentApplications,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'Pending' }),
      Application.countDocuments({ status: 'Under Review' }),
      Application.countDocuments({ status: 'Approved' }),
      Application.countDocuments({ status: 'Rejected' }),
      Application.aggregate([
        { $group: { _id: '$academicInfo.course', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Application.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('applicationNumber personalInfo.fullName personalInfo.email academicInfo.course status createdAt')
        .lean(),
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalApplications,
        pendingApplications,
        underReviewApplications,
        approvedApplications,
        rejectedApplications,
      },
      courseBreakdown: courseBreakdown.map((c) => ({
        course: c._id || 'Unspecified',
        count: c.count,
      })),
      recentApplications,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/applications
 * Lists all student applications with search (name, email, applicationNumber) & status/course filter.
 */
router.get('/applications', async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const status = (req.query.status || '').trim();
    const course = (req.query.course || '').trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (course && course !== 'All') {
      query['academicInfo.course'] = course;
    }

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { applicationNumber: regex },
        { 'personalInfo.fullName': regex },
        { 'personalInfo.email': regex },
      ];
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('student', 'name email phone isActive')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Application.countDocuments(query),
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/applications/:id
 * Returns full details of a specific application.
 */
router.get('/applications/:id', async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email phone isActive createdAt')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/applications/:id/status
 * Updates application status (Pending, Under Review, Approved, Rejected) and notifies the student.
 */
router.patch('/applications/:id/status', async (req, res, next) => {
  try {
    const { status, adminRemarks = '', rejectionReason = '' } = req.body;
    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    if (status === 'Rejected' && !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required when rejecting an application.',
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    application.status = status;
    application.adminRemarks = adminRemarks.trim();
    application.rejectionReason = status === 'Rejected' ? rejectionReason.trim() : '';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    const historyRemark =
      status === 'Rejected'
        ? `Rejected: ${rejectionReason.trim()}`
        : adminRemarks.trim() || `Status updated to ${status}`;

    application.statusHistory.push({
      status,
      remark: historyRemark,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedAt: new Date(),
    });

    await application.save();

    let notifType = 'info';
    let notifTitle = `Application Status Updated: ${status}`;
    let notifMessage = `Your application (${application.applicationNumber}) status is now ${status}.`;

    if (status === 'Under Review') {
      notifType = 'warning';
      notifMessage = `Your application (${application.applicationNumber}) is currently Under Review by the ABESEC Admissions Committee.${
        adminRemarks.trim() ? ` Remarks: ${adminRemarks.trim()}` : ''
      }`;
    } else if (status === 'Approved') {
      notifType = 'success';
      notifTitle = `Congratulations! Application Approved (${application.applicationNumber})`;
      notifMessage = `Your admission application for ${application.academicInfo.course} at ABESEC Ghaziabad has been Approved.${
        adminRemarks.trim() ? ` Remarks: ${adminRemarks.trim()}` : ''
      }`;
    } else if (status === 'Rejected') {
      notifType = 'error';
      notifTitle = `Application Rejected (${application.applicationNumber})`;
      notifMessage = `Your application for ${application.academicInfo.course} was not approved. Reason: ${rejectionReason.trim()}`;
    }

    await Notification.create({
      user: application.student,
      application: application._id,
      title: notifTitle,
      message: notifMessage,
      type: notifType,
    });

    const updated = await Application.findById(application._id)
      .populate('student', 'name email phone isActive createdAt')
      .populate('reviewedBy', 'name email')
      .lean();

    res.json({
      success: true,
      message: `Application status updated to ${status}.`,
      application: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/students
 * Lists all registered student accounts along with their application status if submitted.
 */
router.get('/students', async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const filter = { role: 'student' };

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const students = await User.find(filter).sort({ createdAt: -1 }).lean();
    const studentIds = students.map((s) => s._id);

    const applications = await Application.find({ student: { $in: studentIds } })
      .select('student applicationNumber status academicInfo.course submittedAt')
      .lean();

    const appByStudent = new Map(applications.map((a) => [String(a.student), a]));

    const records = students.map((s) => ({
      ...s,
      application: appByStudent.get(String(s._id)) || null,
    }));

    res.json({
      success: true,
      students: records,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/students/:id/toggle-active
 * Activates or deactivates a student record.
 */
router.patch('/students/:id/toggle-active', async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    student.isActive = !student.isActive;
    await student.save();

    res.json({
      success: true,
      message: `Student account ${student.isActive ? 'activated' : 'deactivated'}.`,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        isActive: student.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/students/:id
 * Deletes a student record and cleans up their application, uploaded files, and notifications.
 */
router.delete('/students/:id', async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    await Promise.all([
      UploadedFile.deleteMany({ owner: student._id }),
      Application.deleteMany({ student: student._id }),
      Notification.deleteMany({ user: student._id }),
      User.deleteOne({ _id: student._id }),
    ]);

    res.json({
      success: true,
      message: 'Student record and associated data deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
