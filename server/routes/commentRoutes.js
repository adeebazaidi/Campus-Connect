const express = require('express');
const {
  createComment,
  getComments,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:complaintId', protect, createComment);
router.get('/:complaintId', protect, getComments);

module.exports = router;


