const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const Comment = require('../models/Comment');
const User = require('../models/User');

exports.createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description || !category) {
    res.status(400);
    throw new Error('Title, description and category are required');
  }

  // Handle attachments - works with both Cloudinary and local storage
  const attachments =
    req.files?.map((file) => {
      // Cloudinary returns file.path as URL, local storage returns file.path as file path
      const isCloudinary = file.path && file.path.startsWith('http');
      
      return {
        url: isCloudinary 
          ? file.path 
          : `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
        publicId: file.filename || file.public_id || file.originalname,
      };
    }) || [];

  const complaint = await Complaint.create({
    title,
    description,
    category,
    createdBy: req.user._id,
    attachments,
  });

  res.status(201).json(complaint);
});

exports.getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ createdBy: req.user._id })
    .populate('assignedTo', 'name email')
    .sort('-createdAt');
  res.json(complaints);
});

exports.getAllComplaints = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === 'staff'
      ? { $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }] }
      : {};

  const complaints = await Complaint.find(filter)
    .populate('createdBy', 'name email department role')
    .populate('assignedTo', 'name email department role')
    .sort('-createdAt');
  res.json(complaints);
});

exports.getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('createdBy', 'name email department role')
    .populate('assignedTo', 'name email department role');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const isOwner = complaint.createdBy._id.equals(req.user._id);
  const isAssigned =
    complaint.assignedTo && complaint.assignedTo._id.equals(req.user._id);

  const canView =
    req.user.role === 'admin' || isOwner || isAssigned;

  if (!canView) {
    res.status(403);
    throw new Error('You are not allowed to view this complaint');
  }

  const comments = await Comment.find({ complaintId: complaint._id })
    .populate('userId', 'name role')
    .sort('createdAt');

  res.json({ complaint, comments });
});

exports.updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'in-progress', 'resolved'];

  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const isAssigned =
    complaint.assignedTo &&
    complaint.assignedTo.toString() === req.user._id.toString();

  if (req.user.role === 'staff' && !isAssigned) {
    res.status(403);
    throw new Error('Only assigned staff can update this complaint');
  }

  complaint.status = status;
  await complaint.save();
  res.json(complaint);
});

exports.assignComplaint = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const assignee = await User.findById(assignedTo);
  if (!assignee || assignee.role !== 'staff') {
    res.status(400);
    throw new Error('Assignee must be a valid staff member');
  }

  complaint.assignedTo = assignedTo;
  complaint.status =
    complaint.status === 'pending' ? 'in-progress' : complaint.status;
  await complaint.save();

  res.json(complaint);
});

exports.deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const isOwner =
    complaint.createdBy.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!isOwner) {
    res.status(403);
    throw new Error('You cannot delete this complaint');
  }

  await Comment.deleteMany({ complaintId: complaint._id });
  await complaint.deleteOne();

  res.json({ message: 'Complaint removed' });
});


