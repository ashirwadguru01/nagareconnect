const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getNotifications, markAllRead, markOneRead } = require('../controllers/notificationController');

router.get('/',              authMiddleware, getNotifications);
router.patch('/read-all',    authMiddleware, markAllRead);
router.patch('/:id/read',    authMiddleware, markOneRead);

module.exports = router;
