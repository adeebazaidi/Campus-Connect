const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('name');
  res.json(users);
});

exports.getStats = asyncHandler(async (req, res) => {
  const [total, pending, inProgress, resolved, users] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'pending' }),
    Complaint.countDocuments({ status: 'in-progress' }),
    Complaint.countDocuments({ status: 'resolved' }),
    User.countDocuments(),
  ]);

  res.json({
    complaints: {
      total,
      pending,
      inProgress,
      resolved,
    },
    users,
  });
});


