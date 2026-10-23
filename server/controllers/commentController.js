const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Complaint = require('../models/Complaint');
const TimelineEvent = require('../models/TimelineEvent');
const Notification = require('../models/Notification');

const ensureAccess = (complaint, user) => {
  const isOwner = complaint.createdBy.toString() === user._id.toString();
  const isAssigned =
    complaint.assignedTo &&
    complaint.assignedTo.toString() === user._id.toString();
  return isOwner || isAssigned || user.role === 'admin';
};

exports.createComment = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Comment message is required');
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (!ensureAccess(complaint, req.user)) {
    res.status(403);
    throw new Error('You cannot comment on this complaint');
  }

  const comment = await Comment.create({
    complaintId,
    userId: req.user._id,
    message: message.trim(),
  });

  await comment.populate('userId', 'name role');

  // Timeline event (non-blocking)
  try {
    await TimelineEvent.create({
      complaintId,
      type: 'comment_added',
      label:
        req.user.role === 'staff' || req.user.role === 'admin'
          ? 'Staff reply added'
          : 'Comment added',
      actorId: req.user._id,
    });
  } catch { /* ignore */ }

  // Notify other participants (non-blocking)
  try {
    const recipientIds = [
      complaint.createdBy?.toString(),
      complaint.assignedTo?.toString(),
    ]
      .filter(Boolean)
      .filter((id) => id !== req.user._id.toString());
    const uniqueIds = [...new Set(recipientIds)];
    if (uniqueIds.length) {
      await Notification.insertMany(
        uniqueIds.map((rid) => ({
          recipientId: rid,
          type: 'comment_added',
          message: `New comment on: "${complaint.title}"`,
          complaintId: complaint._id,
        }))
      );
    }
  } catch { /* ignore */ }

  res.status(201).json(comment);
});

exports.getComments = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (!ensureAccess(complaint, req.user)) {
    res.status(403);
    throw new Error('You cannot view comments for this complaint');
  }

  const comments = await Comment.find({ complaintId })
    .populate('userId', 'name role')
    .sort('createdAt');
  res.json(comments);
});
