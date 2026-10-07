const db = require('../config/db');

// Get reward catalog
const getCatalog = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reward_catalog WHERE is_active = TRUE ORDER BY points_required ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user points and summary
const getMyPoints = async (req, res) => {
  try {
    const [user] = await db.query('SELECT id, name, points FROM users WHERE id = ?', [req.user.id]);
    if (user.length === 0) return res.status(404).json({ message: 'User not found' });

    const [earned] = await db.query(
      "SELECT COALESCE(SUM(points), 0) AS total FROM reward_transactions WHERE user_id = ? AND type = 'earned'",
      [req.user.id]
    );
    const [redeemed] = await db.query(
      "SELECT COALESCE(SUM(points), 0) AS total FROM reward_transactions WHERE user_id = ? AND type = 'redeemed'",
      [req.user.id]
    );

    res.json({
      current_points: user[0].points,
      total_earned: earned[0].total,
      total_redeemed: redeemed[0].total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transactions history
const getTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT rt.*, rc.name AS catalog_name FROM reward_transactions rt
       LEFT JOIN reward_catalog rc ON rt.catalog_item_id = rc.id
       WHERE rt.user_id = ? ORDER BY rt.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Redeem reward
const redeemReward = async (req, res) => {
  const { catalog_id } = req.body;
  const user_id = req.user.id;

  try {
    const [item] = await db.query(
      'SELECT * FROM reward_catalog WHERE id = ? AND is_active = TRUE',
      [catalog_id]
    );
    if (item.length === 0) return res.status(404).json({ message: 'Reward item not found' });

    const [user] = await db.query('SELECT points FROM users WHERE id = ?', [user_id]);
    if (user[0].points < item[0].points_required) {
      return res.status(400).json({ message: `Insufficient points. Need ${item[0].points_required - user[0].points} more.` });
    }

    // Deduct points and log
    await db.query('UPDATE users SET points = points - ? WHERE id = ?', [item[0].points_required, user_id]);
    await db.query(
      `INSERT INTO reward_transactions (user_id, type, points, description, catalog_item_id) VALUES (?, 'redeemed', ?, ?, ?)`,
      [user_id, item[0].points_required, `Redeemed: ${item[0].name}`, catalog_id]
    );

    res.json({ message: `Successfully redeemed "${item[0].name}"!`, points_spent: item[0].points_required });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCatalog, getMyPoints, getTransactions, redeemReward };
