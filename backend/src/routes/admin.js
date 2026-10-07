const express = require('express');
const router = express.Router();
const {
  getUsers, toggleUserStatus, getWorkers, getStats, getWorkerPerformance, changeUserRole
} = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware, requireRole('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.patch('/users/:id/role', changeUserRole);
router.get('/workers', getWorkers);
router.get('/stats', getStats);
router.get('/worker-performance', getWorkerPerformance);

module.exports = router;
