const express = require('express');
const router  = express.Router();
const { getMyStats, submitRequest, getAllRequests, reviewRequest } = require('../controllers/appraisalController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Worker routes
router.get('/my-stats',  authMiddleware, requireRole('worker'),        getMyStats);
router.post('/request',  authMiddleware, requireRole('worker'),        submitRequest);

// Admin routes
router.get('/',          authMiddleware, requireRole('admin'),         getAllRequests);
router.patch('/:id',     authMiddleware, requireRole('admin'),         reviewRequest);

module.exports = router;
