const User = require('../models/User');
const Course = require('../models/Course');

const DEFAULT_COURSES = [
  {
    code: 'BTECH-CSE',
    name: 'B.Tech Computer Science & Engineering (CSE)',
    department: 'Computer Science & Engineering',
    duration: '4 Years',
    eligibility: '10+2 with Physics, Chemistry & Mathematics (Min 50%)',
    totalSeats: 240,
    annualFee: 142000,
  },
  {
    code: 'BTECH-CSE-AIML',
    name: 'B.Tech CSE (Artificial Intelligence & Machine Learning)',
    department: 'Computer Science & Engineering',
    duration: '4 Years',
    eligibility: '10+2 with Physics, Chemistry & Mathematics (Min 50%)',
    totalSeats: 120,
    annualFee: 145000,
  },
  {
    code: 'BTECH-IT',
    name: 'B.Tech Information Technology (IT)',
    department: 'Information Technology',
    duration: '4 Years',
    eligibility: '10+2 with Physics, Chemistry & Mathematics (Min 50%)',
    totalSeats: 180,
    annualFee: 140000,
  },
  {
    code: 'BTECH-ECE',
    name: 'B.Tech Electronics & Communication Engineering (ECE)',
    department: 'Electronics & Communication',
    duration: '4 Years',
    eligibility: '10+2 with Physics, Chemistry & Mathematics (Min 45%)',
    totalSeats: 120,
    annualFee: 135000,
  },
  {
    code: 'BTECH-ME',
    name: 'B.Tech Mechanical Engineering (ME)',
    department: 'Mechanical Engineering',
    duration: '4 Years',
    eligibility: '10+2 with Physics, Chemistry & Mathematics (Min 45%)',
    totalSeats: 60,
    annualFee: 130000,
  },
  {
    code: 'MCA',
    name: 'Master of Computer Applications (MCA)',
    department: 'Computer Applications',
    duration: '2 Years',
    eligibility: 'Graduation with Mathematics at 10+2 or Graduation level (Min 50%)',
    totalSeats: 120,
    annualFee: 125000,
  },
  {
    code: 'MBA',
    name: 'Master of Business Administration (MBA)',
    department: 'Management Studies',
    duration: '2 Years',
    eligibility: 'Graduation in any discipline (Min 50%)',
    totalSeats: 120,
    annualFee: 130000,
  },
];

/**
 * Idempotently seeds default courses, demo admin account, and demo student account.
 * Safe to run multiple times without creating duplicate records.
 */
async function ensureSeedData({ verbose = false } = {}) {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@abesec.ac.in').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const studentEmail = (process.env.SEED_STUDENT_EMAIL || 'student@abesec.ac.in').toLowerCase();
  const studentPassword = process.env.SEED_STUDENT_PASSWORD || 'Student@12345';

  // Seed courses idempotently
  for (const course of DEFAULT_COURSES) {
    await Course.updateOne(
      { code: course.code },
      { $setOnInsert: course },
      { upsert: true }
    );
  }

  // Seed demo admin account if missing
  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Admissions Administrator',
      email: adminEmail,
      password: adminPassword,
      phone: '+91-120-7135112',
      role: 'admin',
      isActive: true,
    });
    if (verbose) console.log(`[Seed] Created demo admin: ${adminEmail}`);
  }

  // Seed demo student account if missing
  let studentUser = await User.findOne({ email: studentEmail });
  if (!studentUser) {
    studentUser = await User.create({
      name: 'Demo Student (ABESEC)',
      email: studentEmail,
      password: studentPassword,
      phone: '+91-9876543210',
      role: 'student',
      isActive: true,
    });
    if (verbose) console.log(`[Seed] Created demo student: ${studentEmail}`);
  }

  return { adminUser, studentUser };
}

module.exports = { ensureSeedData, DEFAULT_COURSES };
