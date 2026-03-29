import multer from 'multer';
import path from 'path';
import { AppError } from './errorHandler';

// Memory storage for OCR processing
export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed.', 400));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Disk storage for persisting receipt files
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

export const diskUpload = multer({
  storage: diskStorage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed.', 400));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Legacy export for backward compat
export const upload = memoryUpload;
