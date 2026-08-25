const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const upload = require('../middleware/upload');

const instituteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many registration attempts, please try again later' }
});

// @route   POST /api/institute/submit
router.post('/submit', instituteLimiter, upload.any(), async (req, res) => {
  let data = {};
  try {
    if (req.body && req.body.payload) {
      data = typeof req.body.payload === 'string' ? JSON.parse(req.body.payload) : req.body.payload;
    } else if (req.body) {
      data = req.body;
    }
  } catch (parseErr) {
    console.error('Institute payload JSON parse error:', parseErr);
    return res.status(400).json({ success: false, message: 'Invalid payload format.' });
  }
  
  const {
    email,
    password,
    name,
    registrationId,
    address,
    city,
    state
  } = data;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Missing required institute fields (name, email, password).' });
  }

  let client;
  try {
    client = await db.getClient();
    await client.query('BEGIN');

    // 1. Check if email exists
    const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // 2. Check if registrationId is unique if provided
    if (registrationId) {
      const regCheck = await client.query('SELECT id FROM institutes WHERE registration_id = $1', [registrationId]);
      if (regCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, message: 'Registration ID already in use.' });
      }
    }

    // 3. Insert user
    const username = (email.split('@')[0] || `inst_${Date.now()}`).toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 12);
    const userRes = await client.query(
      `INSERT INTO users (email, username, password_hash, role, is_active) VALUES ($1, $2, $3, 'institute', true) RETURNING id`,
      [email, username, passwordHash]
    );
    const userId = userRes.rows[0].id;

    // 4. Insert institute
    const instRes = await client.query(
      `INSERT INTO institutes (user_id, name, registration_id, address, city, state)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId, name, registrationId || null, address || null, city || null, state || null]
    );
    const instituteId = instRes.rows[0].id;

    await client.query('COMMIT');
    res.json({ 
      success: true, 
      message: 'Institute registration submitted successfully. Identity is pending verification.',
      instituteId,
      credentials: {
        email,
        username,
        password
      }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Institute Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration: ' + (error.message || 'Unknown error') });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
