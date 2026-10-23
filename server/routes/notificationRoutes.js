const express = require('express');
const { getMyNotifications, markOneRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/',              getMyNotifications);
router.patch('/read-all',   markAllRead);
router.patch('/:id/read',   markOneRead);

module.exports = router;
