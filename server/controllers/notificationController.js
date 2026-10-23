const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

/** GET /api/notifications — returns the authenticated user's notifications (newest first) */
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id })
    .sort('-createdAt')
    .limit(50)
    .lean();
  res.json(notifications);
});

/** PATCH /api/notifications/:id/read — mark one notification as read */
exports.markOneRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipientId: req.user._id, // prevent reading another user's notification
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.read = true;
  await notification.save();
  res.json({ success: true });
});

/** PATCH /api/notifications/read-all — mark all of the user's notifications as read */
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user._id, read: false },
    { read: true }
  );
  res.json({ success: true });
});
