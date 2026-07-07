const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routers/authRouters');
const complaintRoutes = require('./routers/complaintRoutes');
const notificationRoutes = require('./routers/notificationRoutes');

const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }
});

// Inject io into request objects for route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log(`🔌 Client Initialized: ${socket.id}`);
  
  socket.on('join', ({ role, email }) => {
    if (role) socket.join(role);
    if (email) socket.join(email);
  });
});

app.use(express.json());
app.use(cors());

// 📁 Serve uploaded evidence files as static content
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Database Connected"))
  .catch(err => console.log("❌ Connection Failed:", err));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);

// 🔧 One-time migration: regenerate all caseRefs in new format
app.get('/api/migrate-refs', async (req, res) => {
  const Complaint = require('./models/Complaint');
  const prefixMap = {
    'Deepfake': 'DPF', 'Fraud': 'FRD',
    'Harassment': 'HRS', 'Hacking': 'HCK', 'IdentityTheft': 'IDT'
  };
  try {
    const complaints = await Complaint.find({});
    let updated = 0;
    for (const c of complaints) {
      const prefix = prefixMap[c.type] || 'CYN';
      const year = new Date(c.createdAt).getFullYear();
      const serial = String(Math.floor(100000 + Math.random() * 900000));
      c.caseRef = `${prefix}-${year}-${serial}`;
      await c.save();
      updated++;
    }
    res.json({ success: true, message: `Updated ${updated} complaints with new case refs.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));