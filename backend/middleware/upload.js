const multer = require('multer');

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB per document

const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOC_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 4,
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photograph') {
      if (!PHOTO_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error('Photograph must be a JPG, PNG, or WEBP image.'));
      }
      return cb(null, true);
    }

    if (['tenthMarksheet', 'twelfthMarksheet', 'identityProof'].includes(file.fieldname)) {
      if (!DOC_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error(`${file.fieldname} must be a PDF, JPG, PNG, or WEBP file.`));
      }
      return cb(null, true);
    }

    return cb(new Error(`Unexpected file field: ${file.fieldname}`));
  },
});

const applicationUploadFields = upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'tenthMarksheet', maxCount: 1 },
  { name: 'twelfthMarksheet', maxCount: 1 },
  { name: 'identityProof', maxCount: 1 },
]);

module.exports = {
  applicationUploadFields,
  MAX_FILE_SIZE_BYTES,
};
