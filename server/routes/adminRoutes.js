const express = require('express');
const { getUsers, getStaff, getStats, getStaffWorkload } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/users',    authorizeRoles('admin'), getUsers);
router.get('/staff',    authorizeRoles('admin', 'staff'), getStaff);
router.get('/stats',    authorizeRoles('admin'), getStats);
router.get('/workload', authorizeRoles('admin'), getStaffWorkload);

module.exports = router;


