const express = require('express');
const router = express.Router();
const {
  createComplaint, getAllComplaints, getMyComplaints, getAssignedComplaints,
  getComplaintById, updateStatus, assignComplaint, getMapComplaints,
  getAvailableComplaints, selfAssign,
} = require('../controllers/complaintController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/map', authMiddleware, getMapComplaints);
router.get('/my', authMiddleware, requireRole('citizen'), getMyComplaints);
router.get('/assigned', authMiddleware, requireRole('worker'), getAssignedComplaints);
router.get('/available', authMiddleware, requireRole('worker'), getAvailableComplaints);
router.patch('/:id/self-assign', authMiddleware, requireRole('worker'), selfAssign);
router.get('/', authMiddleware, requireRole('admin'), getAllComplaints);
router.get('/:id', authMiddleware, getComplaintById);
router.post('/', authMiddleware, requireRole('citizen'), upload.single('image'), createComplaint);
router.patch('/:id/status', authMiddleware, requireRole('worker', 'admin'), upload.single('proof'), updateStatus);
router.patch('/:id/assign', authMiddleware, requireRole('admin'), assignComplaint);

module.exports = router;
