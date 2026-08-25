const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Protect all verification routes to only be accessible by System Administrators
router.use(authenticate);
router.use(authorize('system_admin'));

// Helper to write audit log
async function logAudit(client, entityType, entityId, action, actorId, diff) {
  await client.query(
    'INSERT INTO audit_log (entity_type, entity_id, action, actor_id, diff) VALUES ($1, $2, $3, $4, $5)',
    [entityType, entityId, action, actorId, JSON.stringify(diff)]
  );
}

// ======================= ATHLETES =======================

// GET /api/verification/athletes - Fetch athletes
router.get('/athletes', async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT a.id, a.full_name, u.email, a.identity_status, a.created_at, a.is_minor
      FROM athletes a
      JOIN users u ON a.user_id = u.id
      WHERE a.deleted_at IS NULL
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND a.identity_status = $1`;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching athletes:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/verification/athletes/:id/details - Fetch full details
router.get('/athletes/:id/details', async (req, res) => {
  const { id } = req.params;
  try {
    const athleteRes = await db.query(`
      SELECT a.*, u.email 
      FROM athletes a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.id = $1 AND a.deleted_at IS NULL
    `, [id]);
    
    if (athleteRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Athlete not found' });
    }
    
    const athlete = athleteRes.rows[0];

    const guardianRes = await db.query('SELECT * FROM athlete_guardians WHERE athlete_id = $1', [id]);
    
    res.json({
      success: true,
      data: {
        ...athlete,
        guardians: guardianRes.rows
      }
    });
  } catch (err) {
    console.error('Error fetching athlete details:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const { buildMindmapForAthlete } = require('../services/mindmapService');

// GET /api/verification/athletes/:id/mindmap - Fetch full ledger tree for admin
router.get('/athletes/:id/mindmap', async (req, res) => {
  const { id } = req.params;
  try {
    const mindmapData = await buildMindmapForAthlete(id);
    res.json({
      success: true,
      data: mindmapData
    });
  } catch (err) {
    if (err.message === 'Athlete not found') {
      return res.status(404).json({ success: false, message: 'Athlete not found' });
    }
    console.error('Error fetching athlete mindmap:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/verification/athletes/:id - Verify or Reject Athlete
router.put('/athletes/:id', async (req, res) => {
  const { id } = req.params;
  const { identity_status, rejection_reason } = req.body;
  
  if (!['verified', 'rejected'].includes(identity_status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const athleteRes = await client.query('SELECT identity_status, mai_id FROM athletes WHERE id = $1', [id]);
    if (athleteRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Athlete not found' });
    }

    const currentData = athleteRes.rows[0];
    
    let updateQuery = `
      UPDATE athletes 
      SET identity_status = $1, identity_verified_by = $2, identity_verified_at = now(), identity_rejection_reason = $3
    `;
    const params = [identity_status, req.user.id, rejection_reason || null];

    let newMaiId = currentData.mai_id;
    if (identity_status === 'verified' && !newMaiId) {
      newMaiId = `MAI-${uuidv4().split('-')[0].toUpperCase()}`;
      updateQuery += `, mai_id = $4`;
      params.push(newMaiId);
    }

    updateQuery += ` WHERE id = $${params.length + 1}`;
    params.push(id);

    await client.query(updateQuery, params);

    await logAudit(client, 'athlete', id, 'identity_verification', req.user.id, {
      from_status: currentData.identity_status,
      to_status: identity_status,
      assigned_mai_id: newMaiId !== currentData.mai_id ? newMaiId : undefined
    });

    await client.query('COMMIT');
    res.json({ success: true, message: `Athlete identity ${identity_status}`, mai_id: newMaiId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating athlete identity:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

// ======================= INSTITUTES =======================

router.get('/institutes', async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT i.id, i.name, u.email, i.registration_id, i.identity_status, i.created_at
      FROM institutes i
      JOIN users u ON i.user_id = u.id
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE i.identity_status = $1`;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching institutes:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/institutes/:id/details', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT i.*, u.email 
      FROM institutes i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching institute details:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/institutes/:id', async (req, res) => {
  const { id } = req.params;
  const { identity_status, rejection_reason } = req.body;
  
  if (!['verified', 'rejected'].includes(identity_status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const instRes = await client.query('SELECT identity_status FROM institutes WHERE id = $1', [id]);
    if (instRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    const currentStatus = instRes.rows[0].identity_status;
    
    await client.query(`
      UPDATE institutes 
      SET identity_status = $1, identity_verified_by = $2, identity_verified_at = now(), identity_rejection_reason = $3
      WHERE id = $4
    `, [identity_status, req.user.id, rejection_reason || null, id]);

    await logAudit(client, 'institute', id, 'identity_verification', req.user.id, {
      from_status: currentStatus,
      to_status: identity_status
    });

    await client.query('COMMIT');
    res.json({ success: true, message: `Institute identity ${identity_status}` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating institute identity:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

// ======================= ACHIEVEMENTS =======================

router.get('/achievements', async (req, res) => {
  try {
    const query = `
      SELECT 
        ach.id as achievement_id,
        ach.title,
        ach.subtype as competition_name,
        ach.level as achievement_level,
        NULL as result_rank,
        NULL as certificates_upload,
        ach.verification_status,
        a.id as athlete_db_id,
        a.full_name as first_name,
        '' as last_name,
        u.email as email_address
      FROM achievements ach
      JOIN athletes a ON ach.athlete_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE ach.deleted_at IS NULL
      ORDER BY ach.created_at DESC
    `;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching achievements for ledger:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/achievements/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        a.id,
        a.verification_status,
        a.title,
        a.category as achievement_category,
        a.subtype as achievement_subtype,
        a.level as achievement_level,
        a.achievement_date,
        a.age_at_achievement,
        CASE WHEN a.is_team_achievement THEN 'Team' ELSE 'Individual' END as individual_or_team,
        a.reference_number as achievement_reference_number,
        a.official_url as official_achievement_url,
        a.short_description as description,
        r.submitted_by_role as submitter_role,
        r.submitter_name,
        r.submitted_under as organization_name,
        a.athlete_id as institute_id,
        c.name as competition_name,
        c.level as competition_level,
        c.organized_by,
        c.venue_name,
        c.start_date as competition_start_date,
        c.end_date as competition_end_date,
        p.result_type,
        p.final_position as final_position_rank,
        p.performance_value,
        i.reference_number as certificate_number,
        i.status as certificate_type
      FROM achievements a
      LEFT JOIN achievement_registrations r ON a.id = r.achievement_id
      LEFT JOIN competition_events c ON a.id = c.achievement_id
      LEFT JOIN result_performances p ON a.id = p.achievement_id
      LEFT JOIN achievement_issuances i ON r.id = i.registration_id
      WHERE a.id = $1 AND a.deleted_at IS NULL
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching achievement details:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/achievements/:id/status', async (req, res) => {
  const { id } = req.params;
  const { verification_status, rejection_reason } = req.body;
  
  if (!['verified', 'correction_requested', 'rejected'].includes(verification_status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const achRes = await client.query('SELECT verification_status, qr_id FROM achievements WHERE id = $1', [id]);
    if (achRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    const currentData = achRes.rows[0];
    
    let updateQuery = `
      UPDATE achievements 
      SET verification_status = $1, verified_by = $2, verified_at = now(), rejection_reason = $3
    `;
    const params = [verification_status, req.user.id, rejection_reason || null];

    let newQrId = currentData.qr_id;
    if (verification_status === 'verified' && !newQrId) {
      newQrId = uuidv4();
      updateQuery += `, qr_id = $4, locked = true`;
      params.push(newQrId);
    } else if (verification_status === 'verified') {
      updateQuery += `, locked = true`;
    }

    updateQuery += ` WHERE id = $${params.length + 1}`;
    params.push(id);

    await client.query(updateQuery, params);

    await logAudit(client, 'achievement', id, 'achievement_verification', req.user.id, {
      from_status: currentData.verification_status,
      to_status: verification_status,
      assigned_qr_id: newQrId !== currentData.qr_id ? newQrId : undefined
    });

    await client.query('COMMIT');
    res.json({ success: true, message: `Achievement status updated to ${verification_status}`, qr_id: newQrId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating achievement status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
