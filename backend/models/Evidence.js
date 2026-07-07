const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
  mimeType: { type: String, required: true },
  data: { type: Buffer, required: true }
});

module.exports = mongoose.model('Evidence', evidenceSchema);
