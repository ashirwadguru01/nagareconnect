require('dotenv').config(); // MUST be first — before any other require
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes         = require('./src/routes/auth');
const complaintRoutes    = require('./src/routes/complaints');
const rewardRoutes       = require('./src/routes/rewards');
const adminRoutes        = require('./src/routes/admin');
const appraisalRoutes    = require('./src/routes/appraisals');
const notificationRoutes = require('./src/routes/notifications');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve local uploaded images (fallback when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',          authRoutes);
app.use('/api/complaints',    complaintRoutes);
app.use('/api/rewards',       rewardRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/appraisals',    appraisalRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
