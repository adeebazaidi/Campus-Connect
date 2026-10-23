const express = require('express');
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  exportCSV,
} = require('../controllers/complaintController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  upload.array('attachments', 4),
  createComplaint
);
router.get('/my', protect, getMyComplaints);
router.get('/all', protect, authorizeRoles('admin', 'staff'), getAllComplaints);
router.get('/export', protect, authorizeRoles('admin'), exportCSV);
router.get('/:id', protect, getComplaintById);
router.patch(
  '/:id/status',
  protect,
  authorizeRoles('admin', 'staff'),
  updateComplaintStatus
);
router.patch('/:id/assign', protect, authorizeRoles('admin'), assignComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;



