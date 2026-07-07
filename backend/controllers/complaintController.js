const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const Evidence = require('../models/Evidence');
const { sendNotification } = require('../utils/notificationUtils');

// 📋 Generate AI Forensic Report using Gemini v1 REST API directly
exports.generateForensicReport = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Case not found' });

    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCv15kwKQdaRBwvrZoR09kcYIEJJWgDU_Y';
    const MODEL = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const { expertNotes, overrideScore } = req.body;
    
    // Use override score if provided, else fall back to original
    const finalScore = overrideScore ? overrideScore : ((complaint.ai_confidence_score || 0) * 100).toFixed(1);

    // Compact prompt to minimize token usage
    const promptText = `You are a digital forensic expert. Write a professional forensic report using ONLY plain text (no markdown, no asterisks).

CASE DATA:
- Ref: ${complaint.caseRef || complaint._id}
- Type: ${complaint.type}
- Status: ${complaint.status}
- Filed by: ${complaint.email}
- Date: ${new Date(complaint.createdAt).toDateString()}
- Description: ${complaint.description}
- AI Verdict: ${complaint.ai_analysis_result || 'N/A'} (Confidence: ${finalScore}%)
${expertNotes ? `- Expert Observations: ${expertNotes}` : ''}
- Evidence: ${complaint.evidence ? 'Image attached' : 'None'}

Write this exact report structure, filling each section concisely:

FORENSIC ANALYSIS REPORT
========================
Case Ref: ${complaint.caseRef || complaint._id}
Type: ${complaint.type} | Date: ${new Date().toDateString()} | System: Cyber Nethra v2.0

1. EXECUTIVE SUMMARY
2. EVIDENCE ANALYSIS
3. AI MODEL FINDINGS
4. METHODOLOGY
5. KEY FINDINGS
6. LEGAL ASSESSMENT
7. RECOMMENDATION
8. CONCLUSION`;

    // Build content parts — include image if available
    const parts = [];

    if (complaint.evidence && fs.existsSync(complaint.evidence)) {
      const ext = complaint.evidence.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        const imageData = fs.readFileSync(complaint.evidence);
        parts.push({
          inline_data: {
            mime_type: ext === 'jpg' ? 'image/jpeg' : `image/${ext}`,
            data: imageData.toString('base64')
          }
        });
      }
    }

    parts.push({ text: promptText });

    const payload = {
      contents: [{ parts }]
    };

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const reportText = response.data.candidates[0].content.parts[0].text;

    // Save the generated report to the DB so the user can view exactly this report
    complaint.forensic_report = reportText;
    await complaint.save();

    res.json({ report: reportText, caseRef: complaint.caseRef || complaint._id.toString().slice(-6).toUpperCase() });

  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    console.error('Gemini Report Error:', detail);
    res.status(500).json({ error: 'Report generation failed: ' + detail });
  }
};

// 📋 Generate Legal FIR using Gemini v1 REST API directly with minimal tokens
exports.generateLegalFIR = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Case not found' });

    // Using the specifically provided API Key
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCv15kwKQdaRBwvrZoR09kcYIEJJWgDU_Y';
    const MODEL = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    // Compact prompt to minimize token usage
    const promptText = `Draft a formal legal First Information Report (FIR) using ONLY plain text (no markdown format).

DATA:
Ref:${complaint.caseRef || complaint._id}
Type:${complaint.type}
By:${complaint.email}
Desc:${complaint.description}
AI:${complaint.ai_analysis_result || 'N/A'} (Conf:${((complaint.ai_confidence_score || 0) * 100).toFixed(0)}%)

Structure:

OFFICIAL FIRST INFORMATION REPORT (FIR)
=======================================
FIR NO: ${complaint.caseRef || complaint._id.toString().slice(-6).toUpperCase()} | JURISDICTION: Cyber Cell | DATE: ${new Date().toDateString()}

1. COMPLAINANT INFO
2. INCIDENT SUMMARY
3. FORENSIC/AI EVIDENCE 
4. APPLICABLE CYBER LAWS (suggested hypotheticals)
5. AUTHORIZATION & NEXT STEPS
(Include a blank Officer Signature line at the end)`;

    const parts = [{ text: promptText }];

    const payload = {
      contents: [{ parts }]
    };

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const reportText = response.data.candidates[0].content.parts[0].text;
    res.json({ fir: reportText, caseRef: complaint.caseRef || complaint._id.toString().slice(-6).toUpperCase() });

  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    console.error('Gemini FIR Error:', detail);
    res.status(500).json({ error: 'FIR generation failed: ' + detail });
  }
};

// Logic for filing a new complaint
exports.createComplaint = async (req, res) => {
  try {
    const { email, type, description } = req.body;
    const evidencePath = req.file ? req.file.path : null;

    console.log("📝 New Complaint Request:");
    console.log("   - Type:", type);
    console.log("   - Evidence:", evidencePath);

    let aiResult = null;
    let confidenceScore = 0;

    // 🚀 STEP 2: Trigger AI Analysis if Deepfake
    if (type === 'Deepfake' && evidencePath) {
      try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(evidencePath));

        const AI_URL = process.env.AI_SERVER_URL || 'https://cyber-nethra-ai.onrender.com';
        // Call FastAPI Service
        const aiResponse = await axios.post(`${AI_URL}/detect`, formData, {
          headers: {
            ...formData.getHeaders()
          }
        });

        if (aiResponse.data) {
          aiResult = aiResponse.data.label; // "Real" or "Fake"
          confidenceScore = aiResponse.data.confidence_score; // 0.95
          console.log(`🤖 AI Analysis Complete: ${aiResult} (${confidenceScore})`);
        }
      } catch (aiError) {
        console.error("⚠️ AI Service Failed:", aiError.message);
        // We continue even if AI fails, just mark as Pending
      }
    }

    const newComplaint = new Complaint({
      email,
      type,
      description,
      evidence: evidencePath ? 'mongodb' : null,
      // 🚀 Automated Pipeline: Flag immediately if AI is confident it's fake
      status: (aiResult === 'Fake' && confidenceScore > 0.7) ? 'AI-Flagged' : 'Pending',
      ai_analysis_result: aiResult,
      ai_confidence_score: confidenceScore
    });

    await newComplaint.save();

    // 💾 Save raw image file to MongoDB database permanently
    if (evidencePath && fs.existsSync(evidencePath)) {
      const newEvidence = new Evidence({
        complaintId: newComplaint._id,
        mimeType: req.file.mimetype,
        data: fs.readFileSync(evidencePath)
      });
      await newEvidence.save();
      
      // Destroy the temporary ephemeral file so we don't leak space
      try {
        fs.unlinkSync(evidencePath);
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }

    // 📩 Notify User
    await sendNotification(req.io, {
      recipientRole: 'Citizen',
      recipientEmail: email,
      title: 'Complaint Submitted',
      message: `Your case has been successfully filed and is currently Pending.`,
      caseId: newComplaint._id,
      priority: 'Medium'
    });

    // 📩 Notify Cyber Police
    await sendNotification(req.io, {
      recipientRole: 'Cyber Police',
      recipientEmail: null,
      title: `New Case Filed`,
      message: `A new ${type} complaint has been filed and requires review.`,
      caseId: newComplaint._id,
      priority: (aiResult === 'Fake' && confidenceScore > 0.7) ? 'High' : 'Medium'
    });

    res.status(201).json({ message: "Complaint Filed", id: newComplaint._id, caseRef: newComplaint.caseRef, ai_result: aiResult });
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Logic for a citizen to track their own complaints [cite: 33]
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ email: req.params.email }).sort('-createdAt');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
};

// Fetch all complaints (for Police/Experts) with optional type filtering
exports.getAllComplaints = async (req, res) => {
  try {
    const { type, status } = req.query;
    let filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter).sort('-createdAt');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
};

// Update complaint status (for Police)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, fir_report } = req.body;
    
    const updateData = { status };
    if (fir_report) {
      updateData.fir_report = fir_report;
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // 📩 Notify the user about the status update
    await sendNotification(req.io, {
      recipientRole: 'Citizen',
      recipientEmail: complaint.email,
      title: 'Case Status Update',
      message: `Your case status has been changed to: ${status}`,
      caseId: complaint._id,
      priority: 'High'
    });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

// 🗑️ Delete complaint and cleanup evidence file
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    // Clean up MongoDB Evidence
    await Evidence.findOneAndDelete({ complaintId: complaint._id });

    // Remove legacy evidence file if it exists
    if (complaint.evidence && fs.existsSync(complaint.evidence)) {
      try {
        fs.unlinkSync(complaint.evidence);
        console.log(`🗑️ Evidence file deleted: ${complaint.evidence}`);
      } catch (fileErr) {
        console.error("⚠️ Failed to delete evidence file:", fileErr.message);
      }
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Error deleting complaint:", err);
    res.status(500).json({ error: "Deletion failed" });
  }
};

// 📦 Retrieve permanent MongoDB Image Evidence buffer
exports.getEvidence = async (req, res) => {
  try {
    const ev = await Evidence.findOne({ complaintId: req.params.id });
    if (!ev) return res.status(404).send('Image explicitly deleted or missing');
    res.set('Content-Type', ev.mimeType);
    res.send(ev.data);
  } catch(err) {
    console.error("Fetch Ev Error:", err.message);
    res.status(500).send('Network failure retrieving secure image');
  }
};