const db = require('../config/db');

/* ── Helper: create one notification ── */
const createNotification = async (userId, title, message, type = 'info', complaintId = null) => {
  await db.query(
    `INSERT INTO notifications (user_id, title, message, type, complaint_id) VALUES (?, ?, ?, ?, ?)`,
    [userId, title, message, type, complaintId]
  );
};

/* ── GET /api/notifications  — fetch for logged-in user ── */
const getNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ── PATCH /api/notifications/read-all  — mark all read ── */
const markAllRead = async (req, res) => {
  try {
    await db.query(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.id]);
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ── PATCH /api/notifications/:id/read  — mark one read ── */
const markOneRead = async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createNotification, getNotifications, markAllRead, markOneRead };
