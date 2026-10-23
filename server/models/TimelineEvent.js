const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'created',
        'assigned',
        'reassigned',
        'status_changed',
        'comment_added',
        'resolved',
        'deleted',
      ],
    },
    /** Human-readable label shown in the UI */
    label: {
      type: String,
      required: true,
    },
    /** The user who performed the action */
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    /** Extra key-value metadata (old status, new status, assignee name, etc.) */
    meta: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
