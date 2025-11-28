const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary is configured
let hasCloudinary = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let storage;

if (hasCloudinary) {
  // Use Cloudinary if configured
  try {
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const configureCloudinary = require('../config/cloudinary');
    const cloudinary = configureCloudinary();
    
    storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'campusconnect/complaints',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        transformation: [{ quality: 'auto' }],
      },
    });
    console.log('☁️ Using Cloudinary for file storage');
  } catch (error) {
    console.warn('⚠️ Cloudinary configuration error, falling back to local storage:', error.message);
    hasCloudinary = false;
  }
}

if (!hasCloudinary) {
  // Use local file storage as fallback
  const uploadsDir = path.join(__dirname, '../uploads');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
  
  console.log('📁 Using local file storage (uploads folder)');
  console.log('💡 To use Cloudinary, configure CLOUDINARY_* variables in .env');
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 4,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) and PDF files are allowed'));
    }
  },
});

module.exports = upload;


