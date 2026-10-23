const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    /** Who this notification is for */
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    /** Short message shown in the bell dropdown */
    message: {
      type: String,
      required: true,
    },
    /** Optional link to the related complaint */
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
    },
    /** Notification category */
    type: {
      type: String,
      enum: [
        'complaint_submitted',
        'complaint_assigned',
        'status_changed',
        'comment_added',
        'complaint_resolved',
      ],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
