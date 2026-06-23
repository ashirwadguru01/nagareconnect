const db = require('../config/db');

/* ── Worker: Get my stats for current month ── */
const getMyStats = async (req, res) => {
  const worker_id = req.user.id;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  try {
    // Count tasks resolved this month
    const [[{ resolved_this_month }]] = await db.query(
      `SELECT COUNT(*) AS resolved_this_month FROM complaints
       WHERE worker_id = ? AND status = 'resolved'
       AND MONTH(resolved_at) = ? AND YEAR(resolved_at) = ?`,
      [worker_id, month, year]
    );

    // All-time resolved
    const [[{ total_resolved }]] = await db.query(
      `SELECT COUNT(*) AS total_resolved FROM complaints
       WHERE worker_id = ? AND status = 'resolved'`,
      [worker_id]
    );

    // In-progress count
    const [[{ in_progress }]] = await db.query(
      `SELECT COUNT(*) AS in_progress FROM complaints
       WHERE worker_id = ? AND status = 'in_progress'`,
      [worker_id]
    );

    // Existing requests this month
    const [requests] = await db.query(
      `SELECT * FROM appraisal_requests WHERE worker_id = ? AND month = ? AND year = ? ORDER BY created_at DESC`,
      [worker_id, month, year]
    );

    // All-time requests
    const [allRequests] = await db.query(
      `SELECT a.*, u.name AS worker_name FROM appraisal_requests a
       JOIN users u ON a.worker_id = u.id
       WHERE a.worker_id = ? ORDER BY a.created_at DESC LIMIT 10`,
      [worker_id]
    );

    res.json({
      month, year,
      resolved_this_month,
      total_resolved,
      in_progress,
      current_requests: requests,
      history: allRequests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ── Worker: Submit appraisal request ── */
const submitRequest = async (req, res) => {
  const worker_id = req.user.id;
  const { request_type, message } = req.body;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  try {
    // Count tasks resolved this month
    const [[{ resolved_this_month }]] = await db.query(
      `SELECT COUNT(*) AS resolved_this_month FROM complaints
       WHERE worker_id = ? AND status = 'resolved'
       AND MONTH(resolved_at) = ? AND YEAR(resolved_at) = ?`,
      [worker_id, month, year]
    );

    if (resolved_this_month < 1) {
      return res.status(400).json({ message: 'You must have resolved at least 1 task this month to request an appraisal.' });
    }

    // Check for duplicate
    const [existing] = await db.query(
      `SELECT id FROM appraisal_requests WHERE worker_id = ? AND month = ? AND year = ? AND request_type = ?`,
      [worker_id, month, year, request_type]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: `You already submitted a ${request_type} request for this month.` });
    }

    const [result] = await db.query(
      `INSERT INTO appraisal_requests (worker_id, month, year, tasks_completed, request_type, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [worker_id, month, year, resolved_this_month, request_type, message || null]
    );

    res.status(201).json({ id: result.insertId, message: 'Appraisal request submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ── Admin: Get all requests ── */
const getAllRequests = async (req, res) => {
  const { status } = req.query;
  try {
    let query = `
      SELECT a.*, u.name AS worker_name, u.email AS worker_email
      FROM appraisal_requests a
      JOIN users u ON a.worker_id = u.id
    `;
    const params = [];
    if (status) { query += ' WHERE a.status = ?'; params.push(status); }
    query += ' ORDER BY a.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ── Admin: Approve or reject a request ── */
const reviewRequest = async (req, res) => {
  const { id } = req.params;
  const { status, admin_note, bonus_amount } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM appraisal_requests WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    await db.query(
      `UPDATE appraisal_requests SET status = ?, admin_note = ?, bonus_amount = ?,
       approved_at = ? WHERE id = ?`,
      [status, admin_note || null, bonus_amount || null, status === 'approved' ? new Date() : null, id]
    );

    res.json({ message: `Request ${status} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyStats, submitRequest, getAllRequests, reviewRequest };
