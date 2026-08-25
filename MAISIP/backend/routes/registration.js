const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

// Rate limiting for registration
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: { success: false, message: 'Too many registration attempts, please try again later' }
});

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// @route   POST /api/registration/submit
router.post('/submit', registrationLimiter, upload.any(), async (req, res) => {
  let data = {};
  try {
    if (req.body && req.body.payload) {
      data = typeof req.body.payload === 'string' ? JSON.parse(req.body.payload) : req.body.payload;
    } else if (req.body) {
      data = req.body;
    }
  } catch (parseErr) {
    console.error('Payload JSON parse error:', parseErr);
    return res.status(400).json({ success: false, message: 'Invalid payload format.' });
  }

  // Extract file paths from uploaded files
  const fileMap = {};
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(file => {
      fileMap[file.fieldname] = file.path;
    });
  }

  // Extract nested or flat fields
  const basicInfo = data.basicInfo || {};
  const contactInfo = data.contactInfo || {};
  const parentInfo = data.parentInfo || {};
  const sportsProfile = data.sportsProfile || {};

  const fullName = (
    data.fullName || 
    `${basicInfo.firstName || ''} ${basicInfo.middleName ? basicInfo.middleName + ' ' : ''}${basicInfo.lastName || ''}`.trim() || 
    'Registered Athlete'
  );

  const dateOfBirth = data.dateOfBirth || basicInfo.dateOfBirth || '2000-01-01';
  const gender = data.gender || basicInfo.gender || 'Not specified';
  const primarySport = data.primarySport || sportsProfile.primarySport || 'Athletics';
  const playingPosition = data.playingPosition || sportsProfile.position || null;

  // Calculate age & minor status
  let isMinor = false;
  let age = null;
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const ageDiff = Date.now() - dob.getTime();
    if (!isNaN(ageDiff)) {
      age = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
      isMinor = age < 18;
    }
  }
  if (!age && basicInfo.age) {
    age = parseInt(basicInfo.age, 10);
    isMinor = age < 18;
  }

  const ageCategory = data.ageCategory || (isMinor ? 'Junior (Under 18)' : 'Senior');

  // Email and Username generation if not directly provided
  const baseName = (basicInfo.firstName || 'athlete').toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const email = (data.email || contactInfo.email || `${baseName}${randomSuffix}@athlete.maisip.in`).toLowerCase().trim();
  const username = (data.username || `${baseName}${randomSuffix}`).toLowerCase().trim();
  const rawPassword = data.password || 'Athlete@2026';

  const rawInstituteId = data.instituteId || data.linkedInstituteId || (data.adminData?.instituteId) || null;

  const guardian = data.guardian || (parentInfo.name ? {
    name: parentInfo.name,
    relation: parentInfo.relationship || 'Guardian',
    phone: parentInfo.mobile || parentInfo.phone || '0000000000',
    email: parentInfo.email || null
  } : null);

  let client;
  try {
    client = await db.getClient();
    await client.query('BEGIN');

    // 1. Check if user email already exists
    let finalEmail = email;
    let finalUsername = username;
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1 OR username = $2', [finalEmail, finalUsername]);
    if (existingUser.rows.length > 0) {
      const ts = Date.now().toString().slice(-4);
      finalEmail = `${baseName}${ts}@athlete.maisip.in`;
      finalUsername = `${baseName}${ts}`;
    }

    // 2. Insert into users
    const passwordHash = await bcrypt.hash(rawPassword, 12);
    const userRes = await client.query(
      `INSERT INTO users (email, username, password_hash, role, is_active) 
       VALUES ($1, $2, $3, 'athlete', true) 
       RETURNING id`,
      [finalEmail, finalUsername, passwordHash]
    );
    const userId = userRes.rows[0].id;

    // 3. Resolve institute ID if valid UUID
    let validInstituteId = null;
    if (rawInstituteId && uuidRegex.test(rawInstituteId)) {
      const instCheck = await client.query('SELECT id FROM institutes WHERE id = $1', [rawInstituteId]);
      if (instCheck.rows.length > 0) {
        validInstituteId = instCheck.rows[0].id;
      }
    }

    // 4. File URLs
    const profilePhotoUrl = fileMap.profilePhoto || null;

    // 5. Insert into athletes
    const athleteRes = await client.query(
      `INSERT INTO athletes (
        user_id, full_name, date_of_birth, is_minor, gender, primary_sport, playing_position, age_category, current_institute_id, profile_photo_url, identity_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') 
      RETURNING id`,
      [
        userId, fullName, dateOfBirth, isMinor, gender, primarySport,
        playingPosition, ageCategory, validInstituteId, profilePhotoUrl
      ]
    );
    const athleteId = athleteRes.rows[0].id;

    // 6. Insert guardian details if minor or present
    if (guardian && guardian.name && guardian.phone) {
      const parentSigDoc = fileMap.parentSig || null;
      await client.query(
        `INSERT INTO athlete_guardians (
          athlete_id, guardian_name, relation, phone, email, consent_given_at, consent_document_key
        ) VALUES ($1, $2, $3, $4, $5, now(), $6)`,
        [athleteId, guardian.name, guardian.relation || 'Parent', guardian.phone, guardian.email || null, parentSigDoc]
      );
    }

    // 7. Insert initial achievement if provided
    const achs = data.achievements;
    if (achs && (achs.achievementLevel || (achs.competitions && achs.competitions.length > 0))) {
      const achTitle = (achs.competitions && achs.competitions[0]) || `${primarySport} Achievement`;
      await client.query(
        `INSERT INTO achievements (
          athlete_id, title, category, subtype, level, achievement_date, is_team_achievement, verification_status, created_by
        ) VALUES ($1, $2, 'competition_result', $3, $4, CURRENT_DATE, false, 'submitted', $5)`,
        [athleteId, achTitle, primarySport || 'General', achs.achievementLevel || 'District', userId]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Athlete registration submitted successfully. Identity is pending verification.',
      athleteId,
      credentials: {
        email: finalEmail,
        username: finalUsername,
        tempPassword: rawPassword,
        password: rawPassword
      }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Athlete Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration: ' + (error.message || 'Unknown error') });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
