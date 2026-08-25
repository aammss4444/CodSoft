const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../db/db');

// Paths
const ARTIFACT_DIR = 'C:\\Users\\ameyp\\.gemini\\antigravity-ide\\brain\\7ac8b022-0949-4f0e-8229-255f95800518';
const BACKEND_UPLOADS = path.join(__dirname, '../uploads');
const FRONTEND_PUBLIC = path.join(__dirname, '../../frontend/public/uploads');

// Ensure directories exist
[BACKEND_UPLOADS, FRONTEND_PUBLIC].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper to copy file to both backend/uploads and frontend/public/uploads
function saveAsset(filename, sourcePathOrBuffer) {
  const destBackend = path.join(BACKEND_UPLOADS, filename);
  const destFrontend = path.join(FRONTEND_PUBLIC, filename);

  if (Buffer.isBuffer(sourcePathOrBuffer)) {
    fs.writeFileSync(destBackend, sourcePathOrBuffer);
    fs.writeFileSync(destFrontend, sourcePathOrBuffer);
  } else if (typeof sourcePathOrBuffer === 'string' && fs.existsSync(sourcePathOrBuffer)) {
    fs.copyFileSync(sourcePathOrBuffer, destBackend);
    fs.copyFileSync(sourcePathOrBuffer, destFrontend);
  } else if (typeof sourcePathOrBuffer === 'string') {
    fs.writeFileSync(destBackend, sourcePathOrBuffer, 'utf8');
    fs.writeFileSync(destFrontend, sourcePathOrBuffer, 'utf8');
  }
  return `/uploads/${filename}`;
}

async function main() {
  console.log('🚀 Adding Khelo India Youth Games 2025 Gold Medal Achievement...');

  // 1. Prepare and Save Certificate Asset
  const certSource = path.join(ARTIFACT_DIR, 'khelo_india_gold_certificate_1785616285288.png');
  const certUrl = saveAsset('khelo_india_2025_gold_medal_certificate.png', certSource);
  console.log('✅ Certificate asset saved to:', certUrl);

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 2. Fetch Athlete and User
    const athRes = await client.query("SELECT a.id, a.user_id, a.full_name, a.mai_id, inst.name AS inst_name FROM athletes a LEFT JOIN institutes inst ON a.current_institute_id = inst.id WHERE a.mai_id = 'ATH-MH-2023-004521' OR a.full_name ILIKE '%Arjun Prakash Bhosale%' LIMIT 1");
    if (athRes.rows.length === 0) {
      throw new Error('Athlete Arjun Prakash Bhosale not found in database.');
    }
    const athlete = athRes.rows[0];
    const athleteId = athlete.id;
    const userId = athlete.user_id;
    const instituteName = athlete.inst_name || 'Maharashtra State Sports Academy';

    console.log(`👤 Found Athlete: ${athlete.full_name} (ID: ${athleteId}, MAI ID: ${athlete.mai_id})`);

    // -------------------------------------------------------------
    // ACHIEVEMENT 5 (2025-01-25) — Khelo India Youth Games 2025 Gold Medal & Meet Record
    // -------------------------------------------------------------
    const achRes = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement,
        medal_type, final_position_rank, total_participants, performance_value, measurement_unit,
        timing, result_type, result_declaration_date, official_result_number,
        personal_best_achieved, prev_personal_best, new_personal_best, pb_improvement, pb_date,
        record_achieved, record_type, previous_record, new_record, record_holder_before, recognition_authority, record_recognition_date,
        certificate_available, certificate_number, certificate_type, certificate_issue_date, issuing_authority
      ) VALUES (
        $1, 'medal', 'Gold Medal & National Meet Record',
        'Khelo India Youth Games 2025 — 100m Sprint Gold Medal (Meet Record 10.62s)',
        'National', '2025-01-25',
        'Won 1st Place Gold Medal in 100m sprint and set a new U-18 National Meet Record with 10.62 seconds at Jawaharlal Nehru Stadium, Chennai.',
        'KIYG-2025-ATH-GLD-088', 'verified', 7,
        $2, true, 16,
        'Gold', 1, 48, '10.62', 'seconds',
        '10.62s', '1st Place (Gold Medal)', '2025-01-25', 'KIYG-RES-2025-100M-FINAL',
        'Yes', '10.74s', '10.62s', '-0.12s (1.12%)', '2025-01-25',
        'Yes', 'National U-18 Meet Record', '10.70s', '10.62s', 'Rohan Verma (Delhi)', 'Athletics Federation of India', '2025-01-25',
        'Yes', 'KIYG-2025-ATH-GLD-088', 'National Gold Medal Certificate', '2025-02-01', 'Sports Authority of India & Ministry of Youth Affairs and Sports'
      ) RETURNING id
    `, [athleteId, userId]);

    const achId = achRes.rows[0].id;
    console.log(`🏅 Achievement registered with ID: ${achId}`);

    // Registration Branch
    const regRes = await client.query(`
      INSERT INTO achievement_registrations (
        achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date
      ) VALUES (
        $1, 'sports_academy', 'Sunil Gavali, Head of Sports & Chief Coach', $2, '2025-01-28'
      ) RETURNING id
    `, [achId, instituteName]);
    const regId = regRes.rows[0].id;

    // Issuance
    await client.query(`
      INSERT INTO achievement_issuances (
        registration_id, issued_by, reference_number, issued_date, status
      ) VALUES (
        $1, 'Sports Authority of India & Ministry of Youth Affairs and Sports', 'KIYG-2025-ATH-GLD-088', '2025-02-01', 'verified'
      )
    `, [regId]);

    // Competition & Event
    await client.query(`
      INSERT INTO competition_events (
        achievement_id, name, organized_by, recognized_by, venue_name, city, district, state, country, level, format, age_group, start_date, end_date
      ) VALUES (
        $1, '7th Khelo India Youth Games 2025', 'Sports Authority of India (SAI)', 'Athletics Federation of India (AFI)',
        'Jawaharlal Nehru Stadium', 'Chennai', 'Chennai', 'Tamil Nadu', 'India', 'National', 'Individual Track (100m Sprint)', 'Under-18 Boys',
        '2025-01-22', '2025-01-25'
      )
    `, [achId]);

    // Result & Performance
    await client.query(`
      INSERT INTO result_performances (
        achievement_id, result_type, final_position, total_participants, performance_value, measurement_unit, is_personal_best, previous_best
      ) VALUES (
        $1, '1st Place (Gold Medal)', 1, 48, 10.62, 'seconds', true, 10.74
      )
    `, [achId]);

    // Document & Evidence
    const docHash = crypto.createHash('sha256').update('khelo_india_2025_gold_medal_certificate').digest('hex');
    await client.query(`
      INSERT INTO documents (
        achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, uploaded_by, verification_status
      ) VALUES (
        $1, 'National Gold Medal Certificate', 'khelo_india_2025_gold_medal_certificate.png', $2, 'image/png', 385000, $3, $4, 'verified'
      )
    `, [achId, certUrl, docHash, userId]);

    await client.query('COMMIT');
    console.log('🎉 Successfully created and verified 5th achievement for Arjun Prakash Bhosale!');
    console.log(`   - Achievement ID: ${achId}`);
    console.log(`   - Title: Khelo India Youth Games 2025 — 100m Sprint Gold Medal (Meet Record 10.62s)`);
    console.log(`   - Category: Medal (Gold)`);
    console.log(`   - Document: ${certUrl}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding achievement:', err);
    throw err;
  } finally {
    client.release();
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
