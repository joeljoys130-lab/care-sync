const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Storage Engine ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'misc';
    if (file.fieldname === 'avatar') folder = 'avatars';
    else if (file.fieldname === 'medicalFile') folder = 'medical';

    const fullPath = path.join(uploadDir, folder);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ─── File Filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedDocs = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  if (file.fieldname === 'avatar' && allowedImages.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname === 'medicalFile' && allowedDocs.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed for field: ${file.fieldname}`), false);
  }
};

// ─── Upload Instances ─────────────────────────────────────────────────────────
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).single('avatar');

const uploadMedicalFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).array('medicalFile', 5); // max 5 files

// ─── Multer Error Wrapper ─────────────────────────────────────────────────────
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = {
  uploadAvatar: handleUpload(uploadAvatar),
  uploadMedicalFiles: handleUpload(uploadMedicalFiles),
};
