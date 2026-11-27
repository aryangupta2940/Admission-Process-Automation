const Application = require('../models/Application');

/**
 * Generates a unique, human-readable application number such as ABES-2026-0001.
 */
async function generateApplicationNumber() {
  const year = new Date().getFullYear();
  const prefix = `ABES-${year}-`;

  const latest = await Application.findOne({
    applicationNumber: { $regex: `^${prefix}` },
  })
    .sort({ applicationNumber: -1 })
    .select('applicationNumber')
    .lean();

  let nextSeq = 1;
  if (latest && latest.applicationNumber) {
    const parts = latest.applicationNumber.split('-');
    const parsed = parseInt(parts[2], 10);
    if (!Number.isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

module.exports = { generateApplicationNumber };
