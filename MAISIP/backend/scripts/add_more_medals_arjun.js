const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../db/db');

// Paths
const BACKEND_UPLOADS = path.join(__dirname, '../uploads');
const FRONTEND_PUBLIC = path.join(__dirname, '../../frontend/public/uploads');

// Ensure directories exist
[BACKEND_UPLOADS, FRONTEND_PUBLIC].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper to copy file
function saveAsset(filename, content) {
  const destBackend = path.join(BACKEND_UPLOADS, filename);
  const destFrontend = path.join(FRONTEND_PUBLIC, filename);

  fs.writeFileSync(destBackend, content, 'utf8');
  fs.writeFileSync(destFrontend, content, 'utf8');
  
  return `/uploads/${filename}`;
}

// 1. Silver Medal Certificate SVG
function createSilverMedalSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect x="0" y="0" width="800" height="600" fill="#f8fafc" />
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#64748b" stroke-width="8" />
  <rect x="28" y="28" width="744" height="544" fill="none" stroke="#94a3b8" stroke-width="2" />
  
  <text x="400" y="80" font-family="Arial" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">MAHARASHTRA STATE ATHLETICS ASSOCIATION</text>
  
  <text x="400" y="170" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#64748b" text-anchor="middle">MERIT CERTIFICATE - SILVER MEDAL</text>
  
  <text x="400" y="240" font-family="Arial" font-size="18" fill="#334155" text-anchor="middle">This is to certify that</text>
  
  <text x="400" y="290" font-family="Arial" font-size="32" font-weight="bold" fill="#0f172a" text-anchor="middle">Arjun Prakash Bhosale</text>
  <line x1="250" y1="300" x2="550" y2="300" stroke="#cbd5e1" stroke-width="2"/>
  
  <text x="400" y="350" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">has secured SECOND PLACE in the</text>
  <text x="400" y="390" font-family="Arial" font-size="20" font-weight="bold" fill="#1e40af" text-anchor="middle">200m SPRINT (Under-16 Boys)</text>
  
  <text x="400" y="430" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">with a performance of 22.40 seconds</text>
  <text x="400" y="460" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">at the State Athletics Championship 2024</text>

  <text x="150" y="520" font-family="Arial" font-size="14" fill="#0f172a" text-anchor="middle">Date: 25 Aug 2024</text>
  
  <text x="650" y="520" font-family="Arial" font-size="14" font-style="italic" fill="#0f172a" text-anchor="middle">Signed by Secretary</text>
  <line x1="550" y1="500" x2="750" y2="500" stroke="#000" stroke-width="1"/>
</svg>`;
}

// 2. Bronze Medal Certificate SVG
function createBronzeMedalSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect x="0" y="0" width="800" height="600" fill="#fff7ed" />
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#9a3412" stroke-width="8" />
  <rect x="28" y="28" width="744" height="544" fill="none" stroke="#c2410c" stroke-width="2" />
  
  <text x="400" y="80" font-family="Arial" font-size="28" font-weight="bold" fill="#7c2d12" text-anchor="middle">PUNE DISTRICT SPORTS BOARD</text>
  
  <text x="400" y="170" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#b45309" text-anchor="middle">MERIT CERTIFICATE - BRONZE MEDAL</text>
  
  <text x="400" y="240" font-family="Arial" font-size="18" fill="#334155" text-anchor="middle">Awarded to</text>
  
  <text x="400" y="290" font-family="Arial" font-size="32" font-weight="bold" fill="#0f172a" text-anchor="middle">Arjun Prakash Bhosale</text>
  <line x1="250" y1="300" x2="550" y2="300" stroke="#cbd5e1" stroke-width="2"/>
  
  <text x="400" y="350" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">for securing THIRD PLACE in</text>
  <text x="400" y="390" font-family="Arial" font-size="20" font-weight="bold" fill="#7c2d12" text-anchor="middle">4x100m RELAY (Under-16 Boys)</text>
  
  <text x="400" y="430" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">at the Inter-School Athletics Meet 2023</text>

  <text x="150" y="520" font-family="Arial" font-size="14" fill="#0f172a" text-anchor="middle">Date: 12 Dec 2023</text>
  
  <text x="650" y="520" font-family="Arial" font-size="14" font-style="italic" fill="#0f172a" text-anchor="middle">Authorized Signatory</text>
  <line x1="550" y1="500" x2="750" y2="500" stroke="#000" stroke-width="1"/>
</svg>`;
}

async function main() {
  console.log('🚀 Seeding more medals for Arjun Bhosale...');

  const silverSvgUrl = saveAsset('state_silver_medal_2024.svg', createSilverMedalSvg());
  const bronzeSvgUrl = saveAsset('district_bronze_medal_2023.svg', createBronzeMedalSvg());

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Find Arjun
    const athRes = await client.query("SELECT id, user_id FROM athletes WHERE full_name ILIKE '%Arjun Prakash Bhosale%' LIMIT 1");
    if (athRes.rows.length === 0) {
      throw new Error('Arjun not found.');
    }
    const { id: athleteId, user_id: userId } = athRes.rows[0];

    // --- 1. State Silver Medal ---
    console.log('Inserting State Silver Medal...');
    const ach1Res = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement
      ) VALUES (
        $1, 'medal', 'Merit Certificate — Silver Medal',
        'State Athletics Championship 2024 — 200m Sprint Silver Medal',
        'State', '2024-08-25',
        'Secured 2nd Place (Silver Medal) in 200m sprint with a timing of 22.40s.',
        'MSAA/2024/099', 'verified', 7, $2, true, 16
      ) RETURNING id
    `, [athleteId, userId]);
    const ach1Id = ach1Res.rows[0].id;

    const reg1Res = await client.query(`
      INSERT INTO achievement_registrations (achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date)
      VALUES ($1, 'athlete', 'Arjun Bhosale', 'Pune District', '2024-08-30') RETURNING id
    `, [ach1Id]);
    await client.query(`
      INSERT INTO achievement_issuances (registration_id, issued_by, reference_number, issued_date, status)
      VALUES ($1, 'Maharashtra State Athletics Association', 'MSAA/2024/099', '2024-08-25', 'verified')
    `, [reg1Res.rows[0].id]);
    await client.query(`
      INSERT INTO competition_events (achievement_id, name, organized_by, recognized_by, level, start_date, end_date, venue_name, city, district, state, country, format, age_group)
      VALUES ($1, 'State Athletics Championship 2024', 'MSAA', 'AFI', 'State', '2024-08-23', '2024-08-25', 'Balewadi Stadium', 'Pune', 'Pune', 'Maharashtra', 'India', 'Individual Track', 'Under-16')
    `, [ach1Id]);
    await client.query(`
      INSERT INTO result_performances (achievement_id, result_type, final_position, total_participants, performance_value, measurement_unit, is_personal_best)
      VALUES ($1, '2nd Place (Silver Medal)', 2, 64, 22.40, 'seconds', true)
    `, [ach1Id]);
    await client.query(`
      INSERT INTO documents (achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, verification_status, uploaded_by)
      VALUES ($1, 'Merit Certificate', 'state_silver_medal_2024.svg', $2, 'image/svg+xml', 14500, 'dummyhash_silv', 'verified', $3)
    `, [ach1Id, silverSvgUrl, userId]);

    // --- 2. District Bronze Medal ---
    console.log('Inserting District Bronze Medal...');
    const ach2Res = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement
      ) VALUES (
        $1, 'medal', 'Merit Certificate — Bronze Medal',
        'Inter-School Athletics Meet 2023 — 4x100m Bronze Medal',
        'District', '2023-12-12',
        'Secured 3rd Place (Bronze Medal) in 4x100m relay representing the school.',
        'PDSB/2023/441', 'verified', 7, $2, true, 15
      ) RETURNING id
    `, [athleteId, userId]);
    const ach2Id = ach2Res.rows[0].id;

    const reg2Res = await client.query(`
      INSERT INTO achievement_registrations (achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date)
      VALUES ($1, 'school', 'Sports Teacher', 'ZP School Pune', '2023-12-15') RETURNING id
    `, [ach2Id]);
    await client.query(`
      INSERT INTO achievement_issuances (registration_id, issued_by, reference_number, issued_date, status)
      VALUES ($1, 'Pune District Sports Board', 'PDSB/2023/441', '2023-12-12', 'verified')
    `, [reg2Res.rows[0].id]);
    await client.query(`
      INSERT INTO competition_events (achievement_id, name, organized_by, recognized_by, level, start_date, end_date, venue_name, city, district, state, country, format, age_group)
      VALUES ($1, 'Inter-School Athletics Meet 2023', 'PDSB', 'DSYS', 'District', '2023-12-10', '2023-12-12', 'Sanas Ground', 'Pune', 'Pune', 'Maharashtra', 'India', 'Team Relay', 'Under-16')
    `, [ach2Id]);
    await client.query(`
      INSERT INTO result_performances (achievement_id, result_type, final_position, total_participants, performance_value, measurement_unit, is_personal_best)
      VALUES ($1, '3rd Place (Bronze Medal)', 3, 32, null, 'seconds', false)
    `, [ach2Id]);
    await client.query(`
      INSERT INTO documents (achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, verification_status, uploaded_by)
      VALUES ($1, 'Merit Certificate', 'district_bronze_medal_2023.svg', $2, 'image/svg+xml', 13500, 'dummyhash_bron', 'verified', $3)
    `, [ach2Id, bronzeSvgUrl, userId]);

    await client.query('COMMIT');
    console.log('✅ Successfully added more medals for Arjun Bhosale!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

main();
