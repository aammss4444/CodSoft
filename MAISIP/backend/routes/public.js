const express = require('express');
const router = express.Router();
const db = require('../db/db');
const rateLimit = require('express-rate-limit');

// Rate limiting specifically for public verification (against scraping)
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // strict limit per IP
  message: { success: false, message: 'Too many verification attempts from this IP, please try again after 15 minutes.' }
});

// GET /api/public/verify/:qrId
router.get('/verify/:qrId', verifyLimiter, async (req, res) => {
  const { qrId } = req.params;

  try {
    const result = await db.query(`
      SELECT 
        a.qr_id,
        a.title,
        a.category,
        a.level,
        a.achievement_date,
        a.verification_status,
        a.verified_at,
        ath.full_name AS athlete_name,
        ath.mai_id AS athlete_mai_id,
        ath.primary_sport AS sport,
        i.issued_by
      FROM achievements a
      JOIN athletes ath ON a.athlete_id = ath.id
      LEFT JOIN achievement_registrations r ON a.id = r.achievement_id
      LEFT JOIN achievement_issuances i ON r.id = i.registration_id
      WHERE a.qr_id = $1 AND a.deleted_at IS NULL
    `, [qrId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Verified record not found or invalid QR.' });
    }

    const record = result.rows[0];

    // Additional safeguard: only 'verified' achievements should be exposed via this endpoint
    if (record.verification_status !== 'verified') {
      return res.status(404).json({ success: false, message: 'Record is not in a verified state.' });
    }

    res.json({
      success: true,
      data: {
        qr_id: record.qr_id,
        title: record.title,
        category: record.category,
        level: record.level,
        sport: record.sport,
        achievement_date: record.achievement_date,
        verification_status: record.verification_status,
        verified_at: record.verified_at,
        athlete_name: record.athlete_name,
        athlete_mai_id: record.athlete_mai_id,
        issued_by: record.issued_by || 'Unknown Authority'
      }
    });

  } catch (error) {
    console.error('Error fetching public verification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
