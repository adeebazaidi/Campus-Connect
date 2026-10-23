const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const Comment = require('../models/Comment');
const User = require('../models/User');
const TimelineEvent = require('../models/TimelineEvent');
const Notification = require('../models/Notification');

/* ─────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────── */

/** Create a timeline event (non-blocking — errors are suppressed) */
const addTimeline = async (complaintId, type, label, actorId, meta = {}) => {
  try {
    const strMeta = {};
    for (const [k, v] of Object.entries(meta)) strMeta[k] = String(v);
    await TimelineEvent.create({ complaintId, type, label, actorId, meta: strMeta });
  } catch { /* don't break the main operation */ }
};

/** Notify one or more recipients (non-blocking) */
const notify = async (recipientIds, type, message, complaintId) => {
  try {
    const ids = [...new Set(recipientIds.filter(Boolean).map(String))];
    if (!ids.length) return;
    await Notification.insertMany(
      ids.map((rid) => ({ recipientId: rid, type, message, complaintId }))
    );
  } catch { /* don't break the main operation */ }
};

/** IDs of all admin users (cached per-request via caller convenience) */
const getAdminIds = async () => {
  const admins = await User.find({ role: 'admin' }).select('_id').lean();
  return admins.map((a) => a._id.toString());
};

/* ─────────────────────────────────────────────────────────────────────
   Controllers
───────────────────────────────────────────────────────────────────── */

exports.createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description || !category) {
    res.status(400);
    throw new Error('Title, description and category are required');
  }

  const attachments =
    req.files?.map((file) => {
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

  // Timeline + notifications (non-blocking)
  const adminIds = await getAdminIds();
  await addTimeline(complaint._id, 'created', 'Complaint submitted', req.user._id);
  await notify(
    adminIds,
    'complaint_submitted',
    `New complaint: "${title}"`,
    complaint._id
  );

  res.status(201).json(complaint);
});

exports.getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ createdBy: req.user._id })
    .populate('assignedTo', 'name email')
    .sort('-createdAt');
  res.json(complaints);
});

exports.getAllComplaints = asyncHandler(async (req, res) => {
  // Build filter
  const filter =
    req.user.role === 'staff'
      ? { $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }] }
      : {};

  // Optional date-range filtering (with validation)
  const { from, to, status, category, search } = req.query;
  if (from || to) {
    const dateRange = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) dateRange.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        dateRange.$lte = toDate;
      }
    }
    if (Object.keys(dateRange).length > 0) {
      filter.createdAt = dateRange;
    }
  }
  if (status && status !== 'all') filter.status = status;
  if (category && category !== 'all') filter.category = category;

  const complaints = await Complaint.find(filter)
    .populate('createdBy',  'name email department role')
    .populate('assignedTo', 'name email department role')
    .sort('-createdAt');

  // Optional text search (post-query on populated fields)
  if (search && search.trim()) {
    const q = search.toLowerCase();
    const filtered = complaints.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.createdBy?.name?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
    );
    return res.json(filtered);
  }

  res.json(complaints);
});

exports.getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('createdBy',  'name email department role')
    .populate('assignedTo', 'name email department role');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const isOwner    = complaint.createdBy._id.equals(req.user._id);
  const isAssigned = complaint.assignedTo && complaint.assignedTo._id.equals(req.user._id);
  const canView    = req.user.role === 'admin' || isOwner || isAssigned;

  if (!canView) {
    res.status(403);
    throw new Error('You are not allowed to view this complaint');
  }

  const [comments, timeline] = await Promise.all([
    Comment.find({ complaintId: complaint._id }).populate('userId', 'name role').sort('createdAt'),
    TimelineEvent.find({ complaintId: complaint._id }).populate('actorId', 'name role').sort('createdAt'),
  ]);

  res.json({ complaint, comments, timeline });
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

  const oldStatus = complaint.status;
  if (oldStatus === status) {
    // Avoid duplicate timeline entry and notification if unchanged
    await complaint.populate('createdBy', 'name email department role');
    await complaint.populate('assignedTo', 'name email department role');
    return res.json(complaint);
  }

  complaint.status = status;
  await complaint.save();

  // Timeline
  const label = status === 'resolved'
    ? 'Complaint resolved'
    : `Status changed to ${status.replace('-', ' ')}`;
  const eventType = status === 'resolved' ? 'resolved' : 'status_changed';
  await addTimeline(complaint._id, eventType, label, req.user._id, {
    from: oldStatus,
    to: status,
  });

  // Notify the complaint owner
  await notify(
    [complaint.createdBy?.toString()],
    status === 'resolved' ? 'complaint_resolved' : 'status_changed',
    `Your complaint status changed to "${status.replace('-', ' ')}"`,
    complaint._id
  );

  await complaint.populate('createdBy', 'name email department role');
  await complaint.populate('assignedTo', 'name email department role');
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

  if (complaint.assignedTo && complaint.assignedTo.toString() === assignedTo.toString()) {
    // Avoid duplicate assignment timeline entry and notification if unchanged
    await complaint.populate('createdBy', 'name email department role');
    await complaint.populate('assignedTo', 'name email department role');
    return res.json(complaint);
  }

  const isReassign = !!complaint.assignedTo;
  const oldAssignee = complaint.assignedTo?.toString();
  complaint.assignedTo = assignedTo;
  complaint.status = complaint.status === 'pending' ? 'in-progress' : complaint.status;
  await complaint.save();

  // Timeline
  const eventType = isReassign ? 'reassigned' : 'assigned';
  const label = isReassign
    ? `Reassigned to ${assignee.name}`
    : `Assigned to ${assignee.name}`;
  await addTimeline(complaint._id, eventType, label, req.user._id, {
    assigneeName: assignee.name,
  });

  // Notify the new assignee
  const complaintTitle = (
    await Complaint.findById(complaint._id).select('title').lean()
  )?.title || 'a complaint';
  await notify(
    [assignedTo],
    'complaint_assigned',
    `You were assigned to: "${complaintTitle}"`,
    complaint._id
  );

  await complaint.populate('createdBy', 'name email department role');
  await complaint.populate('assignedTo', 'name email department role');
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
  await TimelineEvent.deleteMany({ complaintId: complaint._id });
  await Notification.deleteMany({ complaintId: complaint._id });
  await complaint.deleteOne();

  res.json({ message: 'Complaint removed' });
});

/* CSV export for admins */
exports.exportCSV = asyncHandler(async (req, res) => {
  // Build the same filter as getAllComplaints
  const filter = {};
  const { from, to, status, category } = req.query;
  if (from || to) {
    const dateRange = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) dateRange.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        dateRange.$lte = toDate;
      }
    }
    if (Object.keys(dateRange).length > 0) {
      filter.createdAt = dateRange;
    }
  }
  if (status && status !== 'all') filter.status = status;
  if (category && category !== 'all') filter.category = category;

  const complaints = await Complaint.find(filter)
    .populate('createdBy',  'name email department')
    .populate('assignedTo', 'name email')
    .sort('-createdAt')
    .lean();

  /** Escape a single CSV cell value */
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v);
    // Prevent formula injection
    const dangerous = ['+', '-', '=', '@', '\t', '\r'];
    if (dangerous.some((c) => s.startsWith(c))) return `'${s.replace(/"/g, '""')}`;
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headers = [
    'ID', 'Title', 'Category', 'Status',
    'Submitted By', 'Student Email', 'Department',
    'Assigned To', 'Assignee Email',
    'Submitted At', 'Last Updated',
  ];

  const rows = complaints.map((c) => [
    esc(c._id),
    esc(c.title),
    esc(c.category),
    esc(c.status),
    esc(c.createdBy?.name),
    esc(c.createdBy?.email),
    esc(c.createdBy?.department),
    esc(c.assignedTo?.name),
    esc(c.assignedTo?.email),
    esc(new Date(c.createdAt).toISOString()),
    esc(new Date(c.updatedAt).toISOString()),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const filename = `complaints_${new Date().toISOString().split('T')[0]}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('\uFEFF' + csv); // BOM for Excel UTF-8
});
