const mongoose = require('mongoose');

const generateCaseRef = (type) => {
  const prefixMap = {
    'Deepfake': 'DPF',
    'Fraud': 'FRD',
    'Harassment': 'HRS',
    'Hacking': 'HCK',
    'IdentityTheft': 'IDT',
  };
  const prefix = prefixMap[type] || 'CYN';
  const year = new Date().getFullYear();
  const serial = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit random
  return `${prefix}-${year}-${serial}`;
};

const complaintSchema = new mongoose.Schema({
  email: { type: String, required: true },
  type: { type: String, enum: ['Fraud', 'Deepfake', 'Harassment', 'Hacking', 'IdentityTheft'], required: true },
  description: { type: String, required: true },
  evidence: { type: String },
  status: { type: String, default: 'Pending' },
  caseRef: { type: String },
  ai_analysis_result: { type: String },
  ai_confidence_score: { type: Number },
  forensic_report: { type: String },
  fir_report: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate caseRef before saving if not set
complaintSchema.pre('save', async function () {
  if (!this.caseRef) {
    this.caseRef = generateCaseRef(this.type);
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);