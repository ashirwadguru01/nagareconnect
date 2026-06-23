const express = require('express');
const router = express.Router();
const { getCatalog, getMyPoints, getTransactions, redeemReward } = require('../controllers/rewardController');
const { authMiddleware } = require('../middleware/auth');

router.get('/catalog', authMiddleware, getCatalog);
router.get('/my-points', authMiddleware, getMyPoints);
router.get('/transactions', authMiddleware, getTransactions);
router.post('/redeem', authMiddleware, redeemReward);

module.exports = router;
