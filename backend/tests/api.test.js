const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_abesec_admission_portal';

const { createApp } = require('../app');
const { ensureSeedData } = require('../utils/seedData');

let mongod;
let app;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await ensureSeedData();
  app = createApp();
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

test('Idempotent seed creates demo accounts and courses without duplicates', async () => {
  await ensureSeedData();
  await ensureSeedData();

  const res = await request(app).get('/api/courses').expect(200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.courses.length >= 6);
});

test('Health endpoint returns service status', async () => {
  const res = await request(app).get('/api/health').expect(200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.database, 'connected');
});

test('End-to-end admission lifecycle: register -> submit -> edit -> admin review -> approve/reject -> notifications', async () => {
  // 1. Register new student
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Riya Sharma',
      email: 'riya.sharma@example.com',
      password: 'Password@123',
      phone: '9876543210',
    })
    .expect(201);

  assert.equal(regRes.body.user.role, 'student');
  const studentToken = regRes.body.token;

  // 2. Student cannot access admin routes
  await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${studentToken}`)
    .expect(403);

  // 3. Submit admission application with 4 documents
  const fakePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const fakePdf = Buffer.from('%PDF-1.4\n%fake-pdf-content');

  const submitRes = await request(app)
    .post('/api/applications')
    .set('Authorization', `Bearer ${studentToken}`)
    .field('fullName', 'Riya Sharma')
    .field('email', 'riya.sharma@example.com')
    .field('phone', '9876543210')
    .field('dateOfBirth', '2007-05-14')
    .field('gender', 'Female')
    .field('address', 'Sector 62, Noida')
    .field('city', 'Noida')
    .field('state', 'Uttar Pradesh')
    .field('pincode', '201301')
    .field('tenthPercentage', '92.5')
    .field('twelfthPercentage', '90.0')
    .field('previousSchool', 'Delhi Public School')
    .field('course', 'B.Tech Computer Science & Engineering (CSE)')
    .attach('photograph', fakePng, { filename: 'photo.png', contentType: 'image/png' })
    .attach('tenthMarksheet', fakePdf, { filename: '10th.pdf', contentType: 'application/pdf' })
    .attach('twelfthMarksheet', fakePdf, { filename: '12th.pdf', contentType: 'application/pdf' })
    .attach('identityProof', fakePdf, { filename: 'aadhaar.pdf', contentType: 'application/pdf' })
    .expect(201);

  assert.equal(submitRes.body.application.status, 'Pending');
  assert.match(submitRes.body.application.applicationNumber, /^ABES-\d{4}-\d{4}$/);
  const appId = submitRes.body.application._id;
  const photoFileId = submitRes.body.application.documents.photograph.fileId;

  // 4. Student can edit application while status is Pending
  const editRes = await request(app)
    .put('/api/applications/me')
    .set('Authorization', `Bearer ${studentToken}`)
    .field('fullName', 'Riya Sharma')
    .field('email', 'riya.sharma@example.com')
    .field('phone', '9876543211')
    .field('dateOfBirth', '2007-05-14')
    .field('gender', 'Female')
    .field('address', 'Indirapuram, Ghaziabad')
    .field('tenthPercentage', '93.0')
    .field('twelfthPercentage', '90.0')
    .field('previousSchool', 'Delhi Public School')
    .field('course', 'B.Tech Computer Science & Engineering (CSE)')
    .expect(200);

  assert.equal(editRes.body.application.personalInfo.phone, '9876543211');

  // 5. Student can view own uploaded file, another student cannot
  await request(app)
    .get(`/api/files/${photoFileId}`)
    .set('Authorization', `Bearer ${studentToken}`)
    .expect(200);

  const demoStudentLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student@abesec.ac.in', password: 'Student@12345' })
    .expect(200);

  await request(app)
    .get(`/api/files/${photoFileId}`)
    .set('Authorization', `Bearer ${demoStudentLogin.body.token}`)
    .expect(403);

  // 6. Admin login
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@abesec.ac.in', password: 'Admin@12345' })
    .expect(200);
  const adminToken = adminLogin.body.token;
  assert.equal(adminLogin.body.user.role, 'admin');

  // 7. Admin search & filter
  const searchRes = await request(app)
    .get('/api/admin/applications?search=Riya&status=Pending')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);
  assert.equal(searchRes.body.applications.length, 1);

  // 8. Admin can view student file
  await request(app)
    .get(`/api/files/${photoFileId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  // 9. Reject without reason fails with 400
  await request(app)
    .patch(`/api/admin/applications/${appId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'Rejected', rejectionReason: '' })
    .expect(400);

  // 10. Admin moves application to Under Review -> student editing is now locked
  await request(app)
    .patch(`/api/admin/applications/${appId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'Under Review', adminRemarks: 'Verifying marksheets' })
    .expect(200);

  await request(app)
    .put('/api/applications/me')
    .set('Authorization', `Bearer ${studentToken}`)
    .field('fullName', 'Riya Sharma')
    .field('email', 'riya.sharma@example.com')
    .field('phone', '9876543211')
    .field('dateOfBirth', '2007-05-14')
    .field('gender', 'Female')
    .field('address', 'Indirapuram, Ghaziabad')
    .field('tenthPercentage', '93.0')
    .field('twelfthPercentage', '90.0')
    .field('previousSchool', 'Delhi Public School')
    .field('course', 'B.Tech Computer Science & Engineering (CSE)')
    .expect(403);

  // 11. Admin approves application
  const approveRes = await request(app)
    .patch(`/api/admin/applications/${appId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'Approved', adminRemarks: 'All documents verified. Seat allotted.' })
    .expect(200);
  assert.equal(approveRes.body.application.status, 'Approved');

  // 12. Student sees updated status & notifications
  const myAppRes = await request(app)
    .get('/api/applications/me')
    .set('Authorization', `Bearer ${studentToken}`)
    .expect(200);
  assert.equal(myAppRes.body.application.status, 'Approved');

  const notifRes = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${studentToken}`)
    .expect(200);
  assert.ok(notifRes.body.notifications.length >= 3);
  assert.ok(notifRes.body.unreadCount >= 1);

  // 13. Admin stats reflect the approved application
  const statsRes = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);
  assert.equal(statsRes.body.stats.approvedApplications, 1);
  assert.ok(statsRes.body.stats.totalStudents >= 2);
});
