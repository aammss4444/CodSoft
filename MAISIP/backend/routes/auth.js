const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db/db');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_2026';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide a username/email and password' });
  }

  const client = await db.getClient();
  try {
    const userResult = await client.query('SELECT * FROM users WHERE email = $1 OR username = $1', [identifier]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Determine instituteId or athleteId
    let instituteId = null;
    let athleteId = null;

    if (user.role === 'institute') {
      const instResult = await client.query('SELECT id FROM institutes WHERE user_id = $1', [user.id]);
      if (instResult.rows.length > 0) instituteId = instResult.rows[0].id;
    } else if (user.role === 'athlete') {
      const athResult = await client.query('SELECT id FROM athletes WHERE user_id = $1', [user.id]);
      if (athResult.rows.length > 0) athleteId = athResult.rows[0].id;
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      instituteId,
      athleteId
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    const hashedRefresh = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await client.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, hashedRefresh, expiresAt]
    );

    // Update last login (Wait, last_login is not in the new users schema! I'll skip it, or add it if needed. The spec didn't mention last_login in users table).

    res.json({
      success: true,
      accessToken,
      token: accessToken,
      refreshToken,
      user: payload
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

// @route   POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }

  const hashedRefresh = hashToken(refreshToken);
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const tokenRes = await client.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()',
      [hashedRefresh]
    );

    if (tokenRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(401).json({ success: false, message: 'Refresh token revoked or not found' });
    }

    const userResult = await client.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      await client.query('ROLLBACK');
      return res.status(401).json({ success: false, message: 'User deactivated or not found' });
    }

    const user = userResult.rows[0];

    let instituteId = null;
    let athleteId = null;

    if (user.role === 'institute') {
      const instResult = await client.query('SELECT id FROM institutes WHERE user_id = $1', [user.id]);
      if (instResult.rows.length > 0) instituteId = instResult.rows[0].id;
    } else if (user.role === 'athlete') {
      const athResult = await client.query('SELECT id FROM athletes WHERE user_id = $1', [user.id]);
      if (athResult.rows.length > 0) athleteId = athResult.rows[0].id;
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      instituteId,
      athleteId
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const newHashedRefresh = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Revoke old
    await client.query('UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1', [hashedRefresh]);
    // Insert new
    await client.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, newHashedRefresh, expiresAt]
    );

    await client.query('COMMIT');
    res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Refresh error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

// @route   POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token required' });
  }

  const hashedRefresh = hashToken(refreshToken);
  try {
    await db.query('UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1', [hashedRefresh]);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
