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
    complaints: { total, pending, inProgress, resolved },
    users,
  });
});

/** GET /api/admin/workload — staff workload summary */
exports.getStaffWorkload = asyncHandler(async (req, res) => {
  // All staff members
  const staffMembers = await User.find({ role: 'staff' }).select('name email department').lean();

  // For each staff member, count assigned complaints by status
  const workload = await Promise.all(
    staffMembers.map(async (staff) => {
      const [open, inProgress, resolved, total] = await Promise.all([
        Complaint.countDocuments({ assignedTo: staff._id, status: 'pending' }),
        Complaint.countDocuments({ assignedTo: staff._id, status: 'in-progress' }),
        Complaint.countDocuments({ assignedTo: staff._id, status: 'resolved' }),
        Complaint.countDocuments({ assignedTo: staff._id }),
      ]);
      return {
        _id:        staff._id,
        name:       staff.name,
        email:      staff.email,
        department: staff.department,
        pending:    open,
        inProgress,
        resolved,
        total,
      };
    })
  );

  res.json(workload);
});
