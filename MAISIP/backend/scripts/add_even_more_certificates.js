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

// 1. Participation Certificate SVG
function createWorkshopCertSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect x="0" y="0" width="800" height="600" fill="#f0fdf4" />
  <rect x="15" y="15" width="770" height="570" fill="none" stroke="#166534" stroke-width="6" />
  
  <text x="400" y="80" font-family="Arial" font-size="28" font-weight="bold" fill="#14532d" text-anchor="middle">MAHARASHTRA SPORTS ACADEMY</text>
  
  <text x="400" y="160" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#166534" text-anchor="middle">CERTIFICATE OF PARTICIPATION</text>
  
  <text x="400" y="240" font-family="Arial" font-size="18" fill="#334155" text-anchor="middle">This is proudly presented to</text>
  
  <text x="400" y="290" font-family="Arial" font-size="32" font-weight="bold" fill="#0f172a" text-anchor="middle">Arjun Prakash Bhosale</text>
  <line x1="250" y1="300" x2="550" y2="300" stroke="#cbd5e1" stroke-width="2"/>
  
  <text x="400" y="350" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">for successfully completing the Advanced Sprinting Techniques Workshop</text>
  <text x="400" y="390" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">held at Balewadi Sports Complex from June 10-14, 2024.</text>

  <text x="150" y="520" font-family="Arial" font-size="14" fill="#0f172a" text-anchor="middle">Date: 15 Jun 2024</text>
  
  <text x="650" y="520" font-family="Arial" font-size="14" font-style="italic" fill="#0f172a" text-anchor="middle">Director of Coaching</text>
  <line x1="550" y1="500" x2="750" y2="500" stroke="#000" stroke-width="1"/>
</svg>`;
}

// 2. Recognition Certificate SVG
function createRecognitionCertSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect x="0" y="0" width="800" height="600" fill="#fffbeb" />
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#b45309" stroke-width="8" />
  
  <text x="400" y="90" font-family="Arial" font-size="28" font-weight="bold" fill="#78350f" text-anchor="middle">DISTRICT SPORTS COUNCIL, PUNE</text>
  
  <text x="400" y="180" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#b45309" text-anchor="middle">CERTIFICATE OF RECOGNITION</text>
  
  <text x="400" y="260" font-family="Arial" font-size="20" fill="#334155" text-anchor="middle">Awarded to</text>
  
  <text x="400" y="320" font-family="Arial" font-size="36" font-weight="bold" fill="#0f172a" text-anchor="middle">Arjun Prakash Bhosale</text>
  
  <text x="400" y="400" font-family="Arial" font-size="18" fill="#334155" text-anchor="middle">In recognition of outstanding dedication and excellence</text>
  <text x="400" y="440" font-family="Arial" font-size="18" fill="#334155" text-anchor="middle">in Track &amp; Field for the year 2024-2025.</text>

  <text x="150" y="520" font-family="Arial" font-size="14" fill="#0f172a" text-anchor="middle">Date: 28 Feb 2025</text>
  
  <text x="650" y="520" font-family="Arial" font-size="14" font-style="italic" fill="#0f172a" text-anchor="middle">District Sports Officer</text>
  <line x1="550" y1="500" x2="750" y2="500" stroke="#000" stroke-width="1"/>
</svg>`;
}

async function main() {
  console.log('🚀 Seeding more certificates for Arjun Bhosale...');

  const workshopSvgUrl = saveAsset('workshop_cert_2024.svg', createWorkshopCertSvg());
  const recognitionSvgUrl = saveAsset('recognition_cert_2025.svg', createRecognitionCertSvg());

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Find Arjun
    const athRes = await client.query("SELECT id, user_id FROM athletes WHERE full_name ILIKE '%Arjun Prakash Bhosale%' LIMIT 1");
    if (athRes.rows.length === 0) {
      throw new Error('Arjun not found.');
    }
    const { id: athleteId, user_id: userId } = athRes.rows[0];

    // --- 1. Workshop Certificate ---
    console.log('Inserting Workshop Certificate...');
    const ach1Res = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement
      ) VALUES (
        $1, 'certificate', 'Participation Certificate',
        'Advanced Sprinting Techniques Workshop',
        'State', '2024-06-14',
        'Successfully completed a 5-day state level coaching workshop on sprinting mechanics.',
        'MSA/WK/2024/0991', 'verified', 7, $2, true, 16
      ) RETURNING id
    `, [athleteId, userId]);
    const ach1Id = ach1Res.rows[0].id;

    const reg1Res = await client.query(`
      INSERT INTO achievement_registrations (achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date)
      VALUES ($1, 'athlete', 'Arjun Bhosale', 'Maharashtra Sports Academy', '2024-06-20') RETURNING id
    `, [ach1Id]);
    await client.query(`
      INSERT INTO achievement_issuances (registration_id, issued_by, reference_number, issued_date, status)
      VALUES ($1, 'Maharashtra Sports Academy', 'MSA/WK/2024/0991', '2024-06-15', 'verified')
    `, [reg1Res.rows[0].id]);
    
    await client.query(`
      INSERT INTO documents (achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, verification_status, uploaded_by)
      VALUES ($1, 'Participation Certificate', 'workshop_cert_2024.svg', $2, 'image/svg+xml', 14000, 'dummyhash_wk', 'verified', $3)
    `, [ach1Id, workshopSvgUrl, userId]);

    // --- 2. Recognition Certificate ---
    console.log('Inserting Recognition Certificate...');
    const ach2Res = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement
      ) VALUES (
        $1, 'certificate', 'Recognition Certificate',
        'District Sports Award 2024-2025',
        'District', '2025-02-28',
        'Awarded by the District Sports Council for outstanding dedication to athletics.',
        'DSC/PUN/2025/112', 'verified', 7, $2, true, 16
      ) RETURNING id
    `, [athleteId, userId]);
    const ach2Id = ach2Res.rows[0].id;

    const reg2Res = await client.query(`
      INSERT INTO achievement_registrations (achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date)
      VALUES ($1, 'athlete', 'Arjun Bhosale', 'Pune District', '2025-03-01') RETURNING id
    `, [ach2Id]);
    await client.query(`
      INSERT INTO achievement_issuances (registration_id, issued_by, reference_number, issued_date, status)
      VALUES ($1, 'District Sports Council, Pune', 'DSC/PUN/2025/112', '2025-02-28', 'verified')
    `, [reg2Res.rows[0].id]);
    
    await client.query(`
      INSERT INTO documents (achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, verification_status, uploaded_by)
      VALUES ($1, 'Recognition Certificate', 'recognition_cert_2025.svg', $2, 'image/svg+xml', 16000, 'dummyhash_rec', 'verified', $3)
    `, [ach2Id, recognitionSvgUrl, userId]);

    await client.query('COMMIT');
    console.log('✅ Successfully added more certificates for Arjun Bhosale!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

main();
