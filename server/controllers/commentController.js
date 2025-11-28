const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Complaint = require('../models/Complaint');

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

  if (!message) {
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
    message,
  });

  await comment.populate('userId', 'name role');
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


