const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/db');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all user routes and restrict to System Administrator
router.use(authenticate);
router.use(authorize('system_admin'));

// @route   GET /api/users
// @desc    Get all users with their roles
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.email, u.role,
       CASE WHEN u.is_active THEN 'active' ELSE 'inactive' END as status,
       u.created_at, '' as first_name, '' as last_name
       FROM users u 
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/roles
// @desc    Get all available roles
router.get('/roles', async (req, res) => {
  try {
    const roles = [
      { id: 'system_admin', name: 'System Administrator' },
      { id: 'institute', name: 'Institute' },
      { id: 'athlete', name: 'Athlete' }
    ];
    res.json({ success: true, roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/users
// @desc    Create a new user
router.post('/', async (req, res) => {
  const { username, email, password, role_id, first_name, last_name } = req.body;

  if (!username || !email || !password || !role_id) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, role_id, first_name, last_name) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email`,
      [username, email, password_hash, role_id, first_name, last_name]
    );

    res.status(201).json({ success: true, message: 'User created successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Activate or Deactivate user
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    await db.query('UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, req.params.id]);
    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

module.exports = router;
