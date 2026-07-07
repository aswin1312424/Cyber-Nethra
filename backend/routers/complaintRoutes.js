const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createComplaint, getMyComplaints, getAllComplaints, updateComplaintStatus, generateForensicReport, generateLegalFIR, deleteComplaint, getEvidence } = require('../controllers/complaintController');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.post('/', upload.single('evidence'), createComplaint);
router.get('/:id/evidence', getEvidence); // Serve image direct from DB
router.get('/:email', getMyComplaints);
router.get('/', getAllComplaints); // For Police/Experts
router.put('/:id/status', updateComplaintStatus); // For Status Updates
router.delete('/:id', deleteComplaint); // Delete Complaint
router.post('/:id/report', generateForensicReport); // Gemini AI Report
router.post('/:id/fir', generateLegalFIR); // Gemini AI Legal FIR

module.exports = router;