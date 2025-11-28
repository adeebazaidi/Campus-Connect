const express = require('express');
const { getUsers, getStats } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/users', getUsers);
router.get('/stats', getStats);

module.exports = router;


