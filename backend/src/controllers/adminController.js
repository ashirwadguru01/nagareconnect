const db = require('../config/db');

// Get all users
const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, phone, points, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle user active status
const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [id]);
    res.json({ message: 'User status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all workers
const getWorkers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, u.is_active,
              COUNT(c.id) AS total_assigned,
              SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) AS total_resolved
       FROM users u
       LEFT JOIN complaints c ON u.id = c.worker_id
       WHERE u.role = 'worker'
       GROUP BY u.id ORDER BY total_resolved DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats
const getStats = async (req, res) => {
  try {
    const [[{ total_complaints }]] = await db.query('SELECT COUNT(*) AS total_complaints FROM complaints');
    const [[{ pending }]] = await db.query("SELECT COUNT(*) AS pending FROM complaints WHERE status = 'pending'");
    const [[{ in_progress }]] = await db.query("SELECT COUNT(*) AS in_progress FROM complaints WHERE status = 'in_progress'");
    const [[{ resolved }]] = await db.query("SELECT COUNT(*) AS resolved FROM complaints WHERE status = 'resolved'");
    const [[{ total_citizens }]] = await db.query("SELECT COUNT(*) AS total_citizens FROM users WHERE role = 'citizen'");
    const [[{ total_workers }]] = await db.query("SELECT COUNT(*) AS total_workers FROM users WHERE role = 'worker'");

    // Monthly trend (last 6 months)
    const [monthly] = await db.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
       FROM complaints
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month ASC`
    );

    res.json({
      total_complaints, pending, in_progress, resolved,
      total_citizens, total_workers, monthly,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get worker performance
const getWorkerPerformance = async (req, res) => {
  const now = new Date();
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email,
              ws.resolved_count, ws.bonus_eligible, ws.month, ws.year
       FROM users u
       LEFT JOIN worker_stats ws ON u.id = ws.worker_id AND ws.month = ? AND ws.year = ?
       WHERE u.role = 'worker'
       ORDER BY COALESCE(ws.resolved_count, 0) DESC`,
      [now.getMonth() + 1, now.getFullYear()]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change user role
const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['citizen', 'worker', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUsers, toggleUserStatus, getWorkers, getStats, getWorkerPerformance, changeUserRole };
