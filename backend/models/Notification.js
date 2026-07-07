const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientRole: {
    type: String,
    enum: ['Citizen', 'Cyber Police', 'Forensic Expert', 'Financial Cyber Officer'],
    required: true
  },
  recipientEmail: { type: String, default: null }, // Null means to all users of that role
  title: { type: String, required: true },
  message: { type: String, required: true },
  caseId: { type: String, default: null }, // Link to complaint
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
