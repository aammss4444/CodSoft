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

// 1. National Gold Certificate SVG
function createNationalGoldSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect x="0" y="0" width="800" height="600" fill="#f8fafc" />
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#ca8a04" stroke-width="8" />
  <rect x="28" y="28" width="744" height="544" fill="none" stroke="#facc15" stroke-width="2" />
  
  <text x="400" y="80" font-family="Arial" font-size="28" font-weight="bold" fill="#1e3a8a" text-anchor="middle">ATHLETICS FEDERATION OF INDIA</text>
  <text x="400" y="110" font-family="Arial" font-size="16" fill="#475569" text-anchor="middle">Affiliated to World Athletics</text>
  
  <text x="400" y="170" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#ca8a04" text-anchor="middle">CERTIFICATE OF MERIT</text>
  
  <text x="400" y="230" font-family="Arial" font-size="18" fill="#334155" text-anchor="middle">This is to certify that</text>
  
  <text x="400" y="280" font-family="Arial" font-size="32" font-weight="bold" fill="#0f172a" text-anchor="middle">Arjun Prakash Bhosale</text>
  <line x1="250" y1="290" x2="550" y2="290" stroke="#cbd5e1" stroke-width="2"/>
  
  <text x="400" y="330" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">representing MAHARASHTRA State has secured FIRST PLACE in</text>
  <text x="400" y="370" font-family="Arial" font-size="20" font-weight="bold" fill="#1e40af" text-anchor="middle">100m SPRINT (Under-16 Boys)</text>
  
  <text x="400" y="410" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">with a performance of 10.85 seconds</text>
  <text x="400" y="440" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">at the 38th National Junior Athletics Championships 2024</text>
  <text x="400" y="470" font-family="Arial" font-size="16" fill="#334155" text-anchor="middle">held at Nehru Stadium, Coimbatore from Nov 7-10, 2024.</text>

  <text x="150" y="530" font-family="Arial" font-size="14" fill="#0f172a" text-anchor="middle">Date: 10 Nov 2024</text>
  <text x="150" y="550" font-family="Arial" font-size="12" fill="#64748b" text-anchor="middle">Cert No: AFI/2024/00892</text>
  
  <text x="650" y="530" font-family="Arial" font-size="14" font-style="italic" fill="#0f172a" text-anchor="middle">Signed by President, AFI</text>
  <line x1="550" y1="510" x2="750" y2="510" stroke="#000" stroke-width="1"/>
</svg>`;
}

// 2. Selection Letter SVG
function createSelectionLetterSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050">
  <rect x="10" y="10" width="780" height="1030" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  
  <text x="400" y="70" font-family="Arial" font-size="24" font-weight="bold" fill="#0f172a" text-anchor="middle">SPORTS AUTHORITY OF INDIA</text>
  <text x="400" y="95" font-family="Arial" font-size="14" fill="#475569" text-anchor="middle">National Coaching Camp Selection Division</text>
  <line x1="50" y1="120" x2="750" y2="120" stroke="#cbd5e1" stroke-width="1"/>
  
  <text x="50" y="160" font-family="Arial" font-size="12" font-weight="bold" fill="#334155">Ref No: SAI/NCOE/ATH/2024/114</text>
  <text x="650" y="160" font-family="Arial" font-size="12" font-weight="bold" fill="#334155">Date: 15-Dec-2024</text>
  
  <text x="400" y="210" font-family="Arial" font-size="16" font-weight="bold" text-decoration="underline" fill="#1e293b" text-anchor="middle">OFFICIAL SELECTION LETTER</text>
  
  <g font-family="Arial" font-size="14" fill="#334155">
    <text x="50" y="270">To,</text>
    <text x="50" y="295" font-weight="bold">Arjun Prakash Bhosale</text>
    <text x="50" y="320">Maharashtra State</text>
    
    <text x="50" y="370">Subject: Selection for the National Athletics Coaching Camp 2025.</text>
    
    <text x="50" y="410">Dear Arjun,</text>
    
    <text x="50" y="440">We are pleased to inform you that based on your outstanding performance in the recent</text>
    <text x="50" y="465">National Junior Championships (Gold in 100m), you have been officially selected for</text>
    <text x="50" y="490">the <tspan font-weight="bold">National Athletics Coaching Camp</tspan> organized by Sports Authority of India.</text>
    
    <text x="50" y="540">Camp Details:</text>
    <text x="70" y="570">• Venue: SAI Netaji Subhas National Institute of Sports, Patiala</text>
    <text x="70" y="595">• Duration: 05 Jan 2025 to 25 Feb 2025</text>
    <text x="70" y="620">• Category: Sprinters (U-18)</text>
    
    <text x="50" y="670">Please report to the camp venue by 04 Jan 2025 with your original certificates and</text>
    <text x="50" y="695">medical fitness report.</text>
    
    <text x="50" y="750">Congratulations on your selection!</text>
  </g>
  
  <text x="650" y="850" font-family="Arial" font-size="14" font-weight="bold" fill="#1e293b" text-anchor="middle">Director (Sports)</text>
  <text x="650" y="870" font-family="Arial" font-size="12" fill="#475569" text-anchor="middle">Sports Authority of India</text>
</svg>`;
}

async function main() {
  console.log('🚀 Seeding additional certificates for Arjun Bhosale...');

  const goldSvgUrl = saveAsset('national_gold_2024.svg', createNationalGoldSvg());
  const selectionSvgUrl = saveAsset('sai_camp_selection_2025.svg', createSelectionLetterSvg());

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Find Arjun
    const athRes = await client.query("SELECT id, user_id FROM athletes WHERE full_name ILIKE '%Arjun Prakash Bhosale%' LIMIT 1");
    if (athRes.rows.length === 0) {
      throw new Error('Arjun not found.');
    }
    const { id: athleteId, user_id: userId } = athRes.rows[0];

    // --- 1. National Gold Medal ---
    console.log('Inserting National Gold Medal...');
    const ach1Res = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement
      ) VALUES (
        $1, 'medal', 'Merit Certificate — Gold Medal',
        'National Gold Medal — 38th Junior Athletics Championships',
        'National', '2024-11-10',
        'Secured 1st Place (Gold Medal) in 100m sprint with a timing of 10.85s.',
        'AFI/2024/00892', 'verified', 7, $2, true, 16
      ) RETURNING id
    `, [athleteId, userId]);
    const ach1Id = ach1Res.rows[0].id;

    const reg1Res = await client.query(`
      INSERT INTO achievement_registrations (achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date)
      VALUES ($1, 'athlete', 'Arjun Bhosale', 'Maharashtra State', '2024-11-15') RETURNING id
    `, [ach1Id]);
    await client.query(`
      INSERT INTO achievement_issuances (registration_id, issued_by, reference_number, issued_date, status)
      VALUES ($1, 'Athletics Federation of India', 'AFI/2024/00892', '2024-11-10', 'verified')
    `, [reg1Res.rows[0].id]);
    await client.query(`
      INSERT INTO competition_events (achievement_id, name, organized_by, recognized_by, level, start_date, end_date, venue_name, city, district, state, country, format, age_group)
      VALUES ($1, '38th National Junior Athletics Championships', 'AFI', 'Athletics Federation of India', 'National', '2024-11-07', '2024-11-10', 'Nehru Stadium', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', 'India', 'Individual Track', 'Under-18')
    `, [ach1Id]);
    await client.query(`
      INSERT INTO result_performances (achievement_id, result_type, final_position, total_participants, performance_value, measurement_unit, is_personal_best)
      VALUES ($1, '1st Place (Gold Medal)', 1, 48, 10.85, 'seconds', true)
    `, [ach1Id]);
    
    await client.query(`
      INSERT INTO documents (achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, verification_status, uploaded_by)
      VALUES ($1, 'Merit Certificate', 'national_gold_2024.svg', $2, 'image/svg+xml', 15000, 'dummyhash', 'verified', $3)
    `, [ach1Id, goldSvgUrl, userId]);

    // --- 2. National Camp Selection ---
    console.log('Inserting SAI Camp Selection...');
    const ach2Res = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement,
        selected_for, selection_level, selection_authority, camp_team_start_date, camp_team_end_date
      ) VALUES (
        $1, 'selection', 'National Team Camp',
        'National Athletics Coaching Camp Selection (SAI)',
        'National', '2024-12-15',
        'Selected for the National Athletics Coaching Camp organized by Sports Authority of India.',
        'SAI/NCOE/ATH/2024/114', 'verified', 7, $2, true, 16,
        'National Athletics Coaching Camp (Sprinters)', 'National Level', 'Sports Authority of India',
        '2025-01-05', '2025-02-25'
      ) RETURNING id
    `, [athleteId, userId]);
    const ach2Id = ach2Res.rows[0].id;

    const reg2Res = await client.query(`
      INSERT INTO achievement_registrations (achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date)
      VALUES ($1, 'athlete', 'Arjun Bhosale', 'SAI NCOE Patiala', '2024-12-20') RETURNING id
    `, [ach2Id]);
    await client.query(`
      INSERT INTO achievement_issuances (registration_id, issued_by, reference_number, issued_date, status)
      VALUES ($1, 'Sports Authority of India', 'SAI/NCOE/ATH/2024/114', '2024-12-15', 'verified')
    `, [reg2Res.rows[0].id]);
    
    await client.query(`
      INSERT INTO documents (achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, verification_status, uploaded_by)
      VALUES ($1, 'Selection Letter', 'sai_camp_selection_2025.svg', $2, 'image/svg+xml', 12000, 'dummyhash2', 'verified', $3)
    `, [ach2Id, selectionSvgUrl, userId]);

    await client.query('COMMIT');
    console.log('✅ Successfully added multiple detailed achievements for Arjun Bhosale!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

main();
