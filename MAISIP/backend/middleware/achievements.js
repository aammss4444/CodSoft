const db = require('../db/db');

/**
 * Middleware to ensure the achievement is in 'draft' or 'correction_requested' status.
 * Requires the route to have :id or :achId as the achievement parameter.
 * Throws 409 Conflict if not draft/correction_requested.
 * Attaches the fetched achievement to req.achievement.
 */
const checkDraftStatus = async (req, res, next) => {
  const achievementId = req.params.achId || req.params.id;

  if (!achievementId) {
    return res.status(400).json({ success: false, message: 'Achievement ID is required.' });
  }

  try {
    const result = await db.query('SELECT * FROM achievements WHERE id = $1 AND deleted_at IS NULL', [achievementId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }

    const achievement = result.rows[0];

    if (!['draft', 'correction_requested'].includes(achievement.verification_status)) {
      return res.status(409).json({ 
        success: false, 
        message: 'Conflict. Achievement cannot be modified unless it is in draft or correction_requested state.' 
      });
    }

    req.achievement = achievement;
    next();
  } catch (error) {
    console.error('Error checking draft status:', error);
    res.status(500).json({ success: false, message: 'Server error checking achievement status.' });
  }
};

module.exports = { checkDraftStatus };
