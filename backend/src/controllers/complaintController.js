const db = require('../config/db');
const { createNotification } = require('./notificationController');

// Create a new complaint (citizen)
const createComplaint = async (req, res) => {
  const { title, description, lat, lng, address, ward, priority } = req.body;
  const citizen_id = req.user.id;

  // Build image URL: Cloudinary gives full https URL; local disk gives just filename
  let image_url = null;
  let image_public_id = null;
  if (req.file) {
    if (req.file.path && req.file.path.startsWith('http')) {
      // Cloudinary
      image_url = req.file.path;
      image_public_id = req.file.filename;
    } else {
      // Local disk — build accessible URL
      const filename = require('path').basename(req.file.path);
      image_url = `/uploads/${filename}`;
      image_public_id = filename;
    }
  }

  try {
    const [result] = await db.query(
      `INSERT INTO complaints (citizen_id, title, description, image_url, image_public_id, lat, lng, address, ward, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [citizen_id, title, description, image_url, image_public_id, lat, lng, address, ward, priority || 'medium']
    );

    // Award +5 points for submitting complaint
    await db.query('UPDATE users SET points = points + 5 WHERE id = ?', [citizen_id]);
    await db.query(
      `INSERT INTO reward_transactions (user_id, type, points, description, complaint_id) VALUES (?, 'earned', 5, 'Points for submitting complaint', ?)`,
      [citizen_id, result.insertId]
    );

    // Log status
    await db.query(
      `INSERT INTO complaint_logs (complaint_id, old_status, new_status, changed_by) VALUES (?, NULL, 'pending', ?)`,
      [result.insertId, citizen_id]
    );

    res.status(201).json({ id: result.insertId, message: 'Complaint submitted! You earned 5 points.' });

    // Notify all admins about the new complaint
    try {
      const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
      await Promise.all(admins.map(admin =>
        createNotification(
          admin.id,
          'New Complaint Filed',
          `A citizen just filed: "${title}"`,
          'complaint',
          result.insertId
        )
      ));
    } catch (_) { /* non-blocking */ }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all complaints (admin)
const getAllComplaints = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    let query = `SELECT c.*, u.name AS citizen_name, u.email AS citizen_email,
                   w.name AS worker_name
                 FROM complaints c
                 JOIN users u ON c.citizen_id = u.id
                 LEFT JOIN users w ON c.worker_id = w.id`;
    const params = [];
    if (status) { query += ' WHERE c.status = ?'; params.push(status); }
    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM complaints${status ? ' WHERE status = ?' : ''}`,
      status ? [status] : []
    );
    res.json({ complaints: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get citizen's own complaints
const getMyComplaints = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, w.name AS worker_name FROM complaints c
       LEFT JOIN users w ON c.worker_id = w.id
       WHERE c.citizen_id = ? ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get worker's assigned complaints
const getAssignedComplaints = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name AS citizen_name, u.phone AS citizen_phone FROM complaints c
       JOIN users u ON c.citizen_id = u.id
       WHERE c.worker_id = ? AND c.status != 'resolved' ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all pending unassigned complaints (worker browse)
const getAvailableComplaints = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name AS citizen_name, u.phone AS citizen_phone
       FROM complaints c
       JOIN users u ON c.citizen_id = u.id
       WHERE c.status = 'pending' AND c.worker_id IS NULL
       ORDER BY c.priority DESC, c.created_at ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Worker self-assigns a complaint
const selfAssign = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Complaint not found' });
    const c = rows[0];
    if (c.worker_id) return res.status(400).json({ message: 'Already assigned to another worker' });
    if (c.status !== 'pending') return res.status(400).json({ message: 'Complaint is not available' });

    await db.query(
      `UPDATE complaints SET worker_id = ?, status = 'in_progress', updated_at = NOW() WHERE id = ?`,
      [req.user.id, id]
    );
    await db.query(
      `INSERT INTO complaint_logs (complaint_id, old_status, new_status, changed_by, note) VALUES (?, 'pending', 'in_progress', ?, 'Self-assigned by worker')`,
      [id, req.user.id]
    );
    res.json({ message: 'Complaint claimed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single complaint
const getComplaintById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name AS citizen_name, u.email AS citizen_email, u.phone AS citizen_phone,
              w.name AS worker_name
       FROM complaints c
       JOIN users u ON c.citizen_id = u.id
       LEFT JOIN users w ON c.worker_id = w.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Complaint not found' });

    const [logs] = await db.query(
      `SELECT cl.*, u.name AS changed_by_name FROM complaint_logs cl
       JOIN users u ON cl.changed_by = u.id WHERE cl.complaint_id = ? ORDER BY cl.changed_at ASC`,
      [req.params.id]
    );
    res.json({ ...rows[0], logs });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update complaint status (worker/admin)
const updateStatus = async (req, res) => {
  const { status, note } = req.body;
  const { id } = req.params;
  const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
  if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  // Workers must upload proof photo when resolving
  if (status === 'resolved' && req.user.role === 'worker' && !req.file) {
    return res.status(400).json({ message: 'Proof photo is required to mark as resolved' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Complaint not found' });

    const old = rows[0];
    if (req.user.role === 'worker' && old.worker_id !== req.user.id) {
      return res.status(403).json({ message: 'Not assigned to this complaint' });
    }

    const resolvedAt = status === 'resolved' ? new Date() : old.resolved_at;
    let proofUrl = old.resolution_proof_url;
    if (req.file) {
      if (req.file.path && req.file.path.startsWith('http')) {
        proofUrl = req.file.path; // Cloudinary URL
      } else {
        proofUrl = `/uploads/${require('path').basename(req.file.path)}`; // local
      }
    }
    const resolutionNote = note || old.resolution_note;

    await db.query(
      'UPDATE complaints SET status = ?, resolved_at = ?, resolution_proof_url = ?, resolution_note = ?, updated_at = NOW() WHERE id = ?',
      [status, resolvedAt, proofUrl, resolutionNote, id]
    );

    await db.query(
      'INSERT INTO complaint_logs (complaint_id, old_status, new_status, changed_by, note) VALUES (?, ?, ?, ?, ?)',
      [id, old.status, status, req.user.id, note || null]
    );

    // Award +20 points to citizen when resolved
    if (status === 'resolved' && old.status !== 'resolved') {
      await db.query('UPDATE users SET points = points + 20 WHERE id = ?', [old.citizen_id]);
      await db.query(
        `INSERT INTO reward_transactions (user_id, type, points, description, complaint_id) VALUES (?, 'earned', 20, 'Points for resolved complaint', ?)`,
        [old.citizen_id, id]
      );

      const now = new Date();
      await db.query(
        `INSERT INTO worker_stats (worker_id, month, year, resolved_count) VALUES (?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE resolved_count = resolved_count + 1`,
        [req.user.id, now.getMonth() + 1, now.getFullYear()]
      );

      const [stats] = await db.query(
        'SELECT * FROM worker_stats WHERE worker_id = ? AND month = ? AND year = ?',
        [req.user.id, now.getMonth() + 1, now.getFullYear()]
      );
      if (stats.length > 0 && stats[0].resolved_count >= 100) {
        await db.query(
          'UPDATE worker_stats SET bonus_eligible = TRUE WHERE worker_id = ? AND month = ? AND year = ?',
          [req.user.id, now.getMonth() + 1, now.getFullYear()]
        );
      }
    }

    res.json({ message: 'Status updated successfully', proof_url: proofUrl });

    // Notify the citizen about status change
    try {
      const notifMap = {
        resolved:    { title: 'Complaint Resolved!',    msg: `Your complaint "${old.title}" has been resolved. You earned +20 points!`, type: 'resolved' },
        rejected:    { title: 'Complaint Rejected',     msg: `Your complaint "${old.title}" was rejected. ${note || ''}`.trim(), type: 'warning' },
        in_progress: { title: 'Complaint In Progress',  msg: `A worker has been assigned to your complaint "${old.title}".`, type: 'info' },
      };
      const n = notifMap[status];
      if (n) await createNotification(old.citizen_id, n.title, n.msg, n.type, parseInt(id));
    } catch (_) { /* non-blocking */ }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign complaint to worker (admin)
const assignComplaint = async (req, res) => {
  const { worker_id } = req.body;
  const { id } = req.params;
  try {
    const [worker] = await db.query("SELECT id FROM users WHERE id = ? AND role = 'worker'", [worker_id]);
    if (worker.length === 0) return res.status(404).json({ message: 'Worker not found' });

    await db.query(
      "UPDATE complaints SET worker_id = ?, status = 'in_progress', updated_at = NOW() WHERE id = ?",
      [worker_id, id]
    );
    await db.query(
      "INSERT INTO complaint_logs (complaint_id, old_status, new_status, changed_by, note) VALUES (?, 'pending', 'in_progress', ?, 'Assigned to worker')",
      [id, req.user.id]
    );

    res.json({ message: 'Complaint assigned successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all complaints for map view
const getMapComplaints = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, lat, lng, status, priority, created_at, address FROM complaints
       WHERE lat IS NOT NULL AND lng IS NOT NULL ORDER BY created_at DESC LIMIT 500`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComplaint, getAllComplaints, getMyComplaints, getAssignedComplaints,
  getComplaintById, updateStatus, assignComplaint, getMapComplaints,
  getAvailableComplaints, selfAssign,
};
