const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticate, authorize } = require('../middleware/auth');
const { checkDraftStatus } = require('../middleware/achievements');

// Public route for athlete registration dropdown (no auth required)
router.get('/', async (req, res) => {
  try {
    const instRes = await db.query('SELECT id, name, city, state, address FROM institutes ORDER BY name ASC');
    res.json({ success: true, institutes: instRes.rows, data: instRes.rows });
  } catch (error) {
    console.error('Error fetching public institutes list:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.use(authenticate);
router.use(authorize('institute'));

// Middleware to resolve instituteId
const attachInstituteId = async (req, res, next) => {
  try {
    const instRes = await db.query('SELECT id FROM institutes WHERE user_id = $1', [req.user.id]);
    if (instRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Institute not found' });
    req.instituteId = instRes.rows[0].id;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.use(attachInstituteId);

// Middleware to verify athlete belongs to this institute
const ensureAthleteOwnership = async (req, res, next) => {
  const athleteId = req.params.id;
  try {
    const athRes = await db.query('SELECT id, is_minor FROM athletes WHERE id = $1 AND current_institute_id = $2 AND deleted_at IS NULL', [athleteId, req.instituteId]);
    if (athRes.rows.length === 0) return res.status(403).json({ success: false, message: 'Forbidden. Athlete does not belong to this institute.' });
    req.athleteId = athRes.rows[0].id;
    req.isMinor = athRes.rows[0].is_minor;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/institutes/me
router.get('/me', async (req, res) => {
  try {
    const instRes = await db.query('SELECT * FROM institutes WHERE id = $1', [req.instituteId]);
    res.json({ success: true, data: instRes.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/institutes/me
router.put('/me', async (req, res) => {
  try {
    const {
      name, address, city, state
    } = req.body;
    
    await db.query(`
      UPDATE institutes 
      SET name = COALESCE($1, name),
          address = COALESCE($2, address),
          city = COALESCE($3, city),
          state = COALESCE($4, state),
          updated_at = NOW()
      WHERE id = $5
    `, [name, address, city, state, req.instituteId]);

    const updated = await db.query('SELECT * FROM institutes WHERE id = $1', [req.instituteId]);
    res.json({ success: true, message: 'Profile updated successfully', data: updated.rows[0] });
  } catch (err) {
    console.error('Error updating institute profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/institutes/me/athletes
router.get('/me/athletes', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const athletesRes = await db.query(`
      SELECT id, full_name, mai_id, primary_sport, identity_status
      FROM athletes 
      WHERE current_institute_id = $1 AND deleted_at IS NULL
      ORDER BY full_name ASC
      LIMIT $2 OFFSET $3
    `, [req.instituteId, limit, offset]);

    res.json({ success: true, data: athletesRes.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/institutes/me/athletes/:id
router.get('/me/athletes/:id', ensureAthleteOwnership, async (req, res) => {
  try {
    const athRes = await db.query('SELECT * FROM athletes WHERE id = $1', [req.athleteId]);
    res.json({ success: true, data: athRes.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const { buildMindmapForAthlete } = require('../services/mindmapService');

// GET /api/institutes/me/athletes/:id/ledger (same as mindmap)
router.get('/me/athletes/:id/ledger', ensureAthleteOwnership, async (req, res) => {
  try {
    const mindmapData = await buildMindmapForAthlete(req.athleteId);
    res.json({
      success: true,
      data: mindmapData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/institutes/me/athletes/:id/achievements/:achId
router.get('/me/athletes/:id/achievements/:achId', ensureAthleteOwnership, async (req, res) => {
  const achId = req.params.achId;
  try {
    const achQuery = `
      SELECT 
        a.*,
        a.category as achievement_category,
        a.subtype as achievement_subtype,
        a.level as achievement_level,
        CASE WHEN a.is_team_achievement THEN 'Team' ELSE 'Individual' END as individual_or_team,
        a.reference_number as achievement_reference_number,
        a.official_url as official_achievement_url,
        a.short_description as description,
        r.submitted_by_role as submitter_role,
        r.submitter_name,
        r.submitted_under as organization_name,
        c.name as competition_name,
        c.level as competition_level,
        c.organized_by,
        c.recognized_by,
        c.venue_name,
        c.start_date as competition_start_date,
        c.end_date as competition_end_date,
        c.city,
        c.district,
        c.state,
        c.country,
        c.age_group,
        c.format as competition_format,
        p.result_type,
        p.final_position as result_rank,
        p.final_position as final_position_rank,
        p.performance_value,
        p.measurement_unit as performance_metric,
        i.reference_number as certificate_number,
        i.status as certificate_type,
        i.issued_by,
        i.issued_date
      FROM achievements a
      LEFT JOIN achievement_registrations r ON a.id = r.achievement_id
      LEFT JOIN competition_events c ON a.id = c.achievement_id
      LEFT JOIN result_performances p ON a.id = p.achievement_id
      LEFT JOIN achievement_issuances i ON r.id = i.registration_id
      WHERE a.id = $1 AND a.athlete_id = $2 AND a.deleted_at IS NULL
    `;
    const achRes = await db.query(achQuery, [achId, req.athleteId]);
    if (achRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    let history = [];
    try {
      const histRes = await db.query(
        `SELECT id, action, diff, created_at,
                COALESCE(diff->>'old_status', '') AS old_status,
                COALESCE(diff->>'new_status', '') AS new_status,
                COALESCE(diff->>'comments', '') AS comments
         FROM audit_log 
         WHERE entity_type = 'achievement' AND (entity_id = $1::text OR entity_id = $1)
         ORDER BY created_at DESC`,
        [achId]
      );
      history = histRes.rows || [];
    } catch (e) {
      history = [];
    }

    let documents = [];
    try {
      const docRes = await db.query(
        `SELECT id, document_type, original_filename, 
                storage_key AS file_url, storage_key, mime_type, verification_status, uploaded_at 
         FROM documents 
         WHERE achievement_id = $1 AND replaced_at IS NULL`,
        [achId]
      );
      documents = docRes.rows || [];
    } catch (e) {
      documents = [];
    }

    res.json({
      success: true,
      achievement: achRes.rows[0],
      history,
      documents
    });
  } catch (err) {
    console.error('Error fetching institute athlete achievement details:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const mapAchievementCategory = (cat) => {
  if (!cat) return 'medal';
  const c = cat.toLowerCase();
  if (c.includes('medal')) return 'medal';
  if (c.includes('rank')) return 'ranking';
  if (c.includes('cert')) return 'certificate';
  if (c.includes('best') || c.includes('pb')) return 'personal_best';
  if (c.includes('record')) return 'sports_record';
  if (c.includes('competition') || c.includes('tournament')) return 'competition_result';
  if (c.includes('select')) return 'selection';
  if (c.includes('participat')) return 'participation';
  if (c.includes('award') || c.includes('recogni')) return 'award_recognition';
  if (c.includes('scholar')) return 'scholarship';
  if (c.includes('team')) return 'team_achievement';
  const valid = ['medal','ranking','certificate','personal_best','sports_record','competition_result','selection','participation','award_recognition','scholarship','team_achievement','other'];
  if (valid.includes(c)) return c;
  return 'other';
};

// POST /api/institutes/me/athletes/:id/achievements
router.post('/me/athletes/:id/achievements', ensureAthleteOwnership, async (req, res) => {
  const rawCat = req.body.category || req.body.achievement_category;
  const category = mapAchievementCategory(rawCat);
  const subtype = req.body.subtype || req.body.achievement_subtype || 'Standard';
  const title = req.body.title || 'Untitled Achievement';
  const level = req.body.level || req.body.achievement_level || 'District';
  const achievement_date = req.body.achievement_date;
  const age_at_achievement = req.body.age_at_achievement ? parseInt(req.body.age_at_achievement, 10) : null;
  const is_team_achievement = req.body.is_team_achievement !== undefined ? req.body.is_team_achievement : (req.body.individual_or_team === 'Team');
  const short_description = req.body.short_description || req.body.description || null;
  const reference_number = req.body.reference_number || req.body.achievement_reference_number || null;
  const official_url = req.body.official_url || req.body.official_achievement_url || null;

  if (req.isMinor) {
    const guardRes = await db.query('SELECT id FROM athlete_guardians WHERE athlete_id = $1', [req.athleteId]);
    if (guardRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Minor athlete requires guardian consent record before submitting achievements.' });
    }
  }

  try {
    const result = await db.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date, age_at_achievement, 
        is_team_achievement, short_description, reference_number, official_url, created_by, current_step
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 2) RETURNING id
    `, [
      req.athleteId, 
      category, 
      subtype, 
      title, 
      level, 
      achievement_date, 
      age_at_achievement, 
      is_team_achievement || false, 
      short_description, 
      reference_number, 
      official_url, 
      req.user.id
    ]);

    res.json({ success: true, message: 'Draft achievement created', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/institutes/me/athletes/:id/achievements/:achId/registration
router.patch('/me/athletes/:id/achievements/:achId/registration', ensureAthleteOwnership, checkDraftStatus, async (req, res) => {
  const { submitted_by_role, submitter_name, submitted_under, issued_by, reference_number, issued_date } = req.body;
  const achId = req.params.achId;

  try {
    await db.withTransaction(async (client) => {
      const regRes = await client.query(`
        INSERT INTO achievement_registrations (achievement_id, submitted_by_role, submitter_name, submitted_under)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (achievement_id) DO UPDATE SET 
          submitted_by_role = EXCLUDED.submitted_by_role,
          submitter_name = EXCLUDED.submitter_name,
          submitted_under = EXCLUDED.submitted_under
        RETURNING id
      `, [achId, submitted_by_role, submitter_name, submitted_under]);
      
      const regId = regRes.rows[0].id;

      if (issued_by) {
        await client.query(`
          INSERT INTO achievement_issuances (registration_id, issued_by, reference_number, issued_date)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (registration_id) DO UPDATE SET 
            issued_by = EXCLUDED.issued_by,
            reference_number = EXCLUDED.reference_number,
            issued_date = EXCLUDED.issued_date
        `, [regId, issued_by, reference_number, issued_date]);
      }

      await client.query('UPDATE achievements SET current_step = 3, updated_by = $1, updated_at = now() WHERE id = $2', [req.user.id, achId]);
    });
    res.json({ success: true, message: 'Registration details updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/institutes/me/athletes/:id/achievements/:achId/competition
router.patch('/me/athletes/:id/achievements/:achId/competition', ensureAthleteOwnership, checkDraftStatus, async (req, res) => {
  const { name, organized_by, recognized_by, governing_federation, venue_name, city, district, state, country, level, format, age_group, start_date, end_date } = req.body;
  const achId = req.params.achId;

  try {
    await db.withTransaction(async (client) => {
      await client.query(`
        INSERT INTO competition_events (achievement_id, name, organized_by, recognized_by, governing_federation, venue_name, city, district, state, country, level, format, age_group, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (achievement_id) DO UPDATE SET 
          name = EXCLUDED.name, organized_by = EXCLUDED.organized_by, recognized_by = EXCLUDED.recognized_by,
          governing_federation = EXCLUDED.governing_federation, venue_name = EXCLUDED.venue_name, city = EXCLUDED.city,
          district = EXCLUDED.district, state = EXCLUDED.state, country = EXCLUDED.country, level = EXCLUDED.level,
          format = EXCLUDED.format, age_group = EXCLUDED.age_group, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date
      `, [achId, name, organized_by, recognized_by, governing_federation, venue_name, city, district, state, country, level, format, age_group, start_date, end_date]);

      await client.query('UPDATE achievements SET current_step = 4, updated_by = $1, updated_at = now() WHERE id = $2', [req.user.id, achId]);
    });
    res.json({ success: true, message: 'Competition details updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Bad Request. Check constraints.' });
  }
});

// PATCH /api/institutes/me/athletes/:id/achievements/:achId/result
router.patch('/me/athletes/:id/achievements/:achId/result', ensureAthleteOwnership, checkDraftStatus, async (req, res) => {
  const { result_type, final_position, total_participants, performance_value, measurement_unit, is_personal_best, previous_best } = req.body;
  const achId = req.params.achId;

  try {
    await db.withTransaction(async (client) => {
      await client.query(`
        INSERT INTO result_performances (achievement_id, result_type, final_position, total_participants, performance_value, measurement_unit, is_personal_best, previous_best)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (achievement_id) DO UPDATE SET 
          result_type = EXCLUDED.result_type, final_position = EXCLUDED.final_position, total_participants = EXCLUDED.total_participants,
          performance_value = EXCLUDED.performance_value, measurement_unit = EXCLUDED.measurement_unit,
          is_personal_best = EXCLUDED.is_personal_best, previous_best = EXCLUDED.previous_best
      `, [achId, result_type, final_position, total_participants, performance_value, measurement_unit, is_personal_best, previous_best]);

      await client.query('UPDATE achievements SET current_step = 5, updated_by = $1, updated_at = now() WHERE id = $2', [req.user.id, achId]);
    });
    res.json({ success: true, message: 'Result details updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/institutes/me/athletes/:id/achievements/:achId/submit
router.post('/me/athletes/:id/achievements/:achId/submit', ensureAthleteOwnership, checkDraftStatus, async (req, res) => {
  const achId = req.params.achId;
  try {
    await db.query(`UPDATE achievements SET verification_status = 'submitted', updated_by = $1, updated_at = now() WHERE id = $2`, [req.user.id, achId]);
    res.json({ success: true, message: 'Achievement submitted for verification.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================= DOCUMENTS =======================

const upload = require('../middleware/upload');
const { processDocument } = require('../services/documentService');

// POST /api/institutes/me/athletes/:id/achievements/:achId/documents
router.post('/me/athletes/:id/achievements/:achId/documents', ensureAthleteOwnership, checkDraftStatus, upload.single('file'), async (req, res) => {
  const achId = req.params.achId;
  const { document_type } = req.body;

  if (!req.file || !document_type) {
    return res.status(400).json({ success: false, message: 'File and document_type are required.' });
  }

  try {
    const processedDoc = await processDocument(req.file);

    await db.withTransaction(async (client) => {
      await client.query(`
        INSERT INTO documents (achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [achId, document_type, processedDoc.originalFilename, processedDoc.storageKey, processedDoc.mimeType, processedDoc.fileSizeBytes, processedDoc.sha256Hash, req.user.id]);
      
      await client.query('UPDATE achievements SET updated_by = $1, updated_at = now() WHERE id = $2', [req.user.id, achId]);
    });

    res.json({ success: true, message: 'Document uploaded successfully', document: processedDoc });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message || 'Error processing document upload' });
  }
});

// PUT /api/institutes/me/athletes/:id/achievements/:achId/documents/:docId
router.put('/me/athletes/:id/achievements/:achId/documents/:docId', ensureAthleteOwnership, checkDraftStatus, upload.single('file'), async (req, res) => {
  const { achId, docId } = req.params;
  const { document_type } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File is required.' });
  }

  try {
    const processedDoc = await processDocument(req.file);

    await db.withTransaction(async (client) => {
      const docRes = await client.query('SELECT storage_key FROM documents WHERE id = $1 AND achievement_id = $2', [docId, achId]);
      
      if (docRes.rows.length === 0) {
        throw new Error('Document not found');
      }

      await client.query(`
        UPDATE documents SET 
          document_type = COALESCE($1, document_type),
          original_filename = $2, storage_key = $3, mime_type = $4, file_size_bytes = $5, sha256_hash = $6,
          uploaded_by = $7, uploaded_at = now(), verification_status = 'submitted'
        WHERE id = $8
      `, [document_type || null, processedDoc.originalFilename, processedDoc.storageKey, processedDoc.mimeType, processedDoc.fileSizeBytes, processedDoc.sha256Hash, req.user.id, docId]);
      
      await client.query('UPDATE achievements SET updated_by = $1, updated_at = now() WHERE id = $2', [req.user.id, achId]);
    });

    res.json({ success: true, message: 'Document replaced successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message || 'Error processing document replacement' });
  }
});

// DELETE /api/institutes/me/athletes/:id/achievements/:achId/documents/:docId
router.delete('/me/athletes/:id/achievements/:achId/documents/:docId', ensureAthleteOwnership, checkDraftStatus, async (req, res) => {
  const { achId, docId } = req.params;

  try {
    await db.withTransaction(async (client) => {
      const result = await client.query('DELETE FROM documents WHERE id = $1 AND achievement_id = $2 RETURNING id', [docId, achId]);
      if (result.rows.length === 0) throw new Error('Document not found');
      await client.query('UPDATE achievements SET updated_by = $1, updated_at = now() WHERE id = $2', [req.user.id, achId]);
    });
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;
