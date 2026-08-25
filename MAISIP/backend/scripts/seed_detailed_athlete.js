const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
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

// Generate an official SVG for Signed Aadhaar Card
function createSignedAadhaarSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 540" width="850" height="540">
  <defs>
    <linearGradient id="flag" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF9933" />
      <stop offset="33%" stop-color="#FF9933" />
      <stop offset="34%" stop-color="#FFFFFF" />
      <stop offset="66%" stop-color="#FFFFFF" />
      <stop offset="67%" stop-color="#138808" />
      <stop offset="100%" stop-color="#138808" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Card Background -->
  <rect x="20" y="20" width="810" height="500" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow)"/>

  <!-- Top Flag Ribbon -->
  <rect x="20" y="20" width="810" height="12" rx="6" fill="url(#flag)"/>

  <!-- Header -->
  <g transform="translate(50, 48)">
    <circle cx="28" cy="28" r="24" fill="#0f172a" opacity="0.06"/>
    <text x="28" y="34" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0f172a" text-anchor="middle">🏛️</text>
    
    <text x="68" y="24" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">भारत सरकार | Government of India</text>
    <text x="68" y="44" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#475569">भारतीय विशिष्ट पहचान प्राधिकरण | UIDAI</text>
  </g>

  <!-- Photo Box -->
  <g transform="translate(60, 130)">
    <rect x="0" y="0" width="160" height="200" rx="8" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="80" y="90" font-family="Arial, sans-serif" font-size="48" text-anchor="middle">🏃‍♂️</text>
    <text x="80" y="130" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">Arjun Bhosale</text>
    <rect x="15" y="160" width="130" height="24" rx="4" fill="#10B981" fill-opacity="0.15"/>
    <text x="80" y="176" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#059669" text-anchor="middle">✓ VERIFIED PHOTO</text>
  </g>

  <!-- Athlete Personal Info -->
  <g transform="translate(250, 135)">
    <text x="0" y="20" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#64748B">नाव / Name:</text>
    <text x="0" y="48" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#0F172A">Arjun Prakash Bhosale</text>
    <text x="0" y="72" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="#334155">अर्जुन प्रकाश भोसले</text>

    <text x="0" y="110" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#64748B">जन्म तारीख / DOB: <tspan font-weight="bold" fill="#0F172A">14/04/2008</tspan></text>
    <text x="240" y="110" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#64748B">लिंग / Gender: <tspan font-weight="bold" fill="#0F172A">पुरुष / Male</tspan></text>

    <text x="0" y="145" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#64748B">पत्ता / Address: <tspan font-weight="500" fill="#334155">At Post Gadchiroli, Maharashtra - 442605</tspan></text>
  </g>

  <!-- Digital Signature Badge / Verification Seal -->
  <g transform="translate(560, 240)">
    <rect x="0" y="0" width="240" height="130" rx="10" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
    <circle cx="30" cy="30" r="14" fill="#10B981"/>
    <text x="30" y="36" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
    <text x="54" y="26" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#065F46">DIGITALLY SIGNED</text>
    <text x="54" y="42" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="#047857">e-Sign Certified via Aadhaar</text>
    
    <line x1="15" y1="58" x2="225" y2="58" stroke="#A7F3D0" stroke-width="1"/>
    <text x="15" y="76" font-family="Arial, sans-serif" font-size="10" fill="#065F46">Signer: Prakash Bhosale (Guardian)</text>
    <text x="15" y="92" font-family="Arial, sans-serif" font-size="10" fill="#065F46">Date: 10 Jan 2023 14:32:05 IST</text>
    <text x="15" y="108" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#059669">UIDAI Authentication: VALID</text>
  </g>

  <!-- Bottom Divider & Aadhaar Number -->
  <line x1="40" y1="410" x2="810" y2="410" stroke="#E2E8F0" stroke-width="1.5"/>
  <g transform="translate(425, 465)">
    <text x="0" y="0" font-family="'Courier New', Courier, monospace" font-size="28" font-weight="bold" fill="#0F172A" text-anchor="middle" letter-spacing="4">
      XXXX  XXXX  4521
    </text>
    <text x="0" y="24" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#DC2626" text-anchor="middle">
      माझे आधार, माझी ओळख (मेरा आधार, मेरी पहचान)
    </text>
  </g>
</svg>`;
}

// Generate SVG for Scholarship Sanction Order
function createScholarshipSanctionSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050">
  <rect x="10" y="10" width="780" height="1030" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  
  <!-- Header -->
  <rect x="10" y="10" width="780" height="100" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
  <text x="400" y="45" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0F172A" text-anchor="middle">GOVERNMENT OF MAHARASHTRA</text>
  <text x="400" y="68" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#334155" text-anchor="middle">Directorate of Sports &amp; Youth Services, Maharashtra State</text>
  <text x="400" y="88" font-family="Arial, sans-serif" font-size="12" fill="#64748B" text-anchor="middle">Shiv Chhatrapati Sports Complex, Mahalunge, Balewadi, Pune - 411045</text>

  <!-- Ref & Date -->
  <text x="50" y="145" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#475569">Order No: DSYS/SCH/2024/0512</text>
  <text x="650" y="145" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#475569">Date: 10/01/2024</text>

  <line x1="50" y1="160" x2="750" y2="160" stroke="#CBD5E1" stroke-width="1.5"/>

  <!-- Title -->
  <rect x="50" y="180" width="700" height="40" rx="6" fill="#0D9488" fill-opacity="0.1"/>
  <text x="400" y="206" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#0D9488" text-anchor="middle">SANCTION ORDER — LAKSHYAVEDH SPORTS EXCELLENCE SCHOLARSHIP</text>

  <!-- Body -->
  <g transform="translate(50, 260)" font-family="Arial, sans-serif" font-size="13" fill="#1E293B" line-height="1.6">
    <text x="0" y="0">Sanction is hereby accorded under the "Lakshyavedh Sports Excellence Scheme" for the grant of annual</text>
    <text x="0" y="24">sports scholarship stipend to the following meritorious student-athlete:</text>

    <!-- Table Details -->
    <g transform="translate(0, 50)">
      <rect x="0" y="0" width="700" height="220" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      
      <text x="20" y="30" font-weight="bold" fill="#64748B">1. Athlete Name:</text>
      <text x="220" y="30" font-weight="bold" fill="#0F172A">Arjun Prakash Bhosale</text>

      <text x="20" y="65" font-weight="bold" fill="#64748B">2. Athlete ID (MAI ID):</text>
      <text x="220" y="65" font-weight="bold" fill="#0F172A">ATH-MH-2023-004521</text>

      <text x="20" y="100" font-weight="bold" fill="#64748B">3. Discipline / Sport:</text>
      <text x="220" y="100" font-weight="bold" fill="#0F172A">Athletics (100m / 200m Track)</text>

      <text x="20" y="135" font-weight="bold" fill="#64748B">4. Sanctioned Amount:</text>
      <text x="220" y="135" font-weight="bold" fill="#0D9488">₹60,000/- (Rupees Sixty Thousand Only) per Annum</text>

      <text x="20" y="170" font-weight="bold" fill="#64748B">5. Tenure &amp; Period:</text>
      <text x="220" y="170" font-weight="bold" fill="#0F172A">12 Months (Academic Year 2024–2025)</text>

      <text x="20" y="200" font-weight="bold" fill="#64748B">6. Affiliated Institute:</text>
      <text x="220" y="200" font-weight="bold" fill="#0F172A">Maharashtra State Sports Academy</text>
    </g>

    <text x="0" y="310">The scholarship amount shall be disbursed directly into the verified bank account of the athlete in quarterly</text>
    <text x="0" y="334">installments, subject to regular performance reports submitted by the registered sports coach.</text>
  </g>

  <!-- Official Stamp and Signature -->
  <g transform="translate(500, 750)">
    <circle cx="80" cy="50" r="45" fill="#0D9488" fill-opacity="0.08" stroke="#0D9488" stroke-width="2" stroke-dasharray="4,2"/>
    <text x="80" y="45" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0D9488" text-anchor="middle">DIRECTORATE OF SPORTS</text>
    <text x="80" y="60" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0D9488" text-anchor="middle">MAHARASHTRA STATE</text>
    
    <text x="80" y="120" font-family="'Brush Script MT', cursive, sans-serif" font-size="24" fill="#0F172A" text-anchor="middle">S. K. Gavali</text>
    <text x="80" y="140" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">Commissioner of Sports</text>
    <text x="80" y="156" font-family="Arial, sans-serif" font-size="11" fill="#64748B" text-anchor="middle">Govt. of Maharashtra</text>
  </g>
</svg>`;
}

async function main() {
  console.log('🚀 Starting detailed athlete creation and registration...');

  // 1. Prepare and Save Demo Assets
  console.log('📦 Preparing demo assets (Profile photo, Signed Aadhaar, Certificates)...');
  
  // Profile Photo
  const profilePhotoSource = path.join(ARTIFACT_DIR, 'arjun_profile_photo_1785615424840.png');
  const profilePhotoUrl = saveAsset('arjun_profile.png', profilePhotoSource);

  // Signed Aadhaar Card
  const aadhaarSvg = createSignedAadhaarSvg();
  const aadhaarUrl = saveAsset('arjun_aadhaar_signed.svg', aadhaarSvg);

  // Merit Certificate
  const meritCertSource = path.join(ARTIFACT_DIR, 'state_merit_certificate_1785615449406.png');
  const meritCertUrl = saveAsset('merit_certificate_state_2023.png', meritCertSource);

  // Selection Letter
  const selectionLetterSource = path.join(ARTIFACT_DIR, 'state_selection_letter_1785615461597.png');
  const selectionLetterUrl = saveAsset('state_selection_letter_2023.png', selectionLetterSource);

  // Scholarship Order
  const scholarshipSvg = createScholarshipSanctionSvg();
  const scholarshipUrl = saveAsset('scholarship_sanction_order_2024.svg', scholarshipSvg);

  console.log('✅ Assets saved to /uploads/ folder:');
  console.log('  - Profile Photo:', profilePhotoUrl);
  console.log('  - Signed Aadhaar:', aadhaarUrl);
  console.log('  - Merit Certificate:', meritCertUrl);
  console.log('  - Selection Letter:', selectionLetterUrl);
  console.log('  - Scholarship Order:', scholarshipUrl);

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 2. Ensure Institute exists
    let instituteId = null;
    let instituteName = 'Maharashtra State Sports Academy';
    const instRes = await client.query("SELECT id, name FROM institutes WHERE name ILIKE '%Maharashtra%' LIMIT 1");
    if (instRes.rows.length > 0) {
      instituteId = instRes.rows[0].id;
      instituteName = instRes.rows[0].name;
    } else {
      const newInst = await client.query(`
        INSERT INTO institutes (name, registration_id, address, city, state, identity_status)
        VALUES ('Maharashtra State Sports Academy', 'MSSA-MH-2023', 'Balewadi Sports Complex', 'Pune', 'Maharashtra', 'verified')
        RETURNING id
      `);
      instituteId = newInst.rows[0].id;
    }

    // 3. Create or Update User for Athlete
    const username = 'arjun_bhosale';
    const email = 'arjun.bhosale@athlete.maisip.in';
    const passwordHash = await bcrypt.hash('Athlete@123', 10);

    let userId;
    const existingUser = await client.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      await client.query(
        'UPDATE users SET password_hash = $1, is_active = true WHERE id = $2',
        [passwordHash, userId]
      );
      console.log('🔄 Updated existing user account:', username);
    } else {
      const userRes = await client.query(`
        INSERT INTO users (username, email, password_hash, role, is_active)
        VALUES ($1, $2, $3, 'athlete', true)
        RETURNING id
      `, [username, email, passwordHash]);
      userId = userRes.rows[0].id;
      console.log('✨ Created new user account:', username, 'ID:', userId);
    }

    // 4. Create or Update Athlete Profile
    const maiId = 'ATH-MH-2023-004521';
    let athleteId;
    const existingAth = await client.query('SELECT id FROM athletes WHERE user_id = $1 OR mai_id = $2', [userId, maiId]);
    if (existingAth.rows.length > 0) {
      athleteId = existingAth.rows[0].id;
      await client.query(`
        UPDATE athletes SET
          full_name = 'Arjun Prakash Bhosale',
          date_of_birth = '2008-04-14',
          gender = 'Male',
          primary_sport = 'Athletics',
          playing_position = '100m / 200m Sprinter',
          age_category = 'Junior (Under 18)',
          current_institute_id = $1,
          profile_photo_url = $2,
          identity_status = 'verified',
          identity_verified_at = now(),
          blood_group = 'B+',
          mobile_number = '+91 98231 45678',
          address_line_1 = 'Flat 402, Shiv Chhatrapati Sports Enclave',
          address_line_2 = 'Balewadi Sports Complex Road',
          city = 'Pune',
          state = 'Maharashtra',
          pincode = '411045',
          country = 'India',
          education_school = 'Maharashtra State Sports Academy & Junior College',
          education_grade = '11th Standard (Sports Merit Batch)',
          education_board = 'Maharashtra State Board (MSBSHSE)',
          height_cm = 176,
          weight_kg = 68,
          preferred_hand_foot = 'Right'
        WHERE id = $3
      `, [instituteId, profilePhotoUrl, athleteId]);
      console.log('🔄 Updated athlete profile:', athleteId);
    } else {
      const athRes = await client.query(`
        INSERT INTO athletes (
          user_id, mai_id, full_name, date_of_birth, gender, primary_sport,
          playing_position, age_category, current_institute_id, profile_photo_url,
          identity_status, identity_verified_at,
          blood_group, mobile_number, address_line_1, address_line_2,
          city, state, pincode, country,
          education_school, education_grade, education_board,
          height_cm, weight_kg, preferred_hand_foot
        ) VALUES (
          $1, $2, 'Arjun Prakash Bhosale', '2008-04-14', 'Male', 'Athletics',
          '100m / 200m Sprinter', 'Junior (Under 18)', $3, $4,
          'verified', now(),
          'B+', '+91 98231 45678', 'Flat 402, Shiv Chhatrapati Sports Enclave', 'Balewadi Sports Complex Road',
          'Pune', 'Maharashtra', '411045', 'India',
          'Maharashtra State Sports Academy & Junior College', '11th Standard (Sports Merit Batch)', 'Maharashtra State Board (MSBSHSE)',
          176, 68, 'Right'
        ) RETURNING id
      `, [userId, maiId, instituteId, profilePhotoUrl]);
      athleteId = athRes.rows[0].id;
      console.log('✨ Created athlete profile:', athleteId);
    }

    // 5. Guardian Info (Minor Athlete)
    await client.query('DELETE FROM athlete_guardians WHERE athlete_id = $1', [athleteId]);
    await client.query(`
      INSERT INTO athlete_guardians (
        athlete_id, guardian_name, relation, phone, email, consent_given_at, consent_document_key
      ) VALUES (
        $1, 'Prakash Bhosale', 'Father', '+91 98231 45678', 'prakash.bhosale@gmail.com', now(), $2
      )
    `, [athleteId, aadhaarUrl]);
    console.log('👨‍👦 Guardian consent linked for minor athlete.');

    // 6. Clean and Recreate Complete Verified Achievements
    await client.query('DELETE FROM achievements WHERE athlete_id = $1', [athleteId]);

    // -------------------------------------------------------------
    // ACHIEVEMENT 1 (2023-05-18) — State Gold Medal Merit Certificate
    // -------------------------------------------------------------
    const ach1Res = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement
      ) VALUES (
        $1, 'medal', 'Merit Certificate — Gold Medal',
        'Merit Certificate — District & State Meet (100m Sprint)',
        'State', '2023-05-18',
        'Won 1st Place Gold Medal in 100m sprint with a record timing of 10.92 seconds.',
        'MAA-2023-GLD-0194', 'verified', 7, $2, true, 15
      ) RETURNING id
    `, [athleteId, userId]);
    const ach1Id = ach1Res.rows[0].id;

    // Ach 1 Registration & Issuance
    const reg1Res = await client.query(`
      INSERT INTO achievement_registrations (
        achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date
      ) VALUES (
        $1, 'school', 'Priya Deshmukh, Sports Teacher', 'ZP School, Gadchiroli', '2023-05-20'
      ) RETURNING id
    `, [ach1Id]);
    await client.query(`
      INSERT INTO achievement_issuances (
        registration_id, issued_by, reference_number, issued_date, status
      ) VALUES (
        $1, 'Maharashtra Athletics Association', 'MAA-2023-GLD-0194', '2023-05-25', 'verified'
      )
    `, [reg1Res.rows[0].id]);

    // Ach 1 Competition & Result
    await client.query(`
      INSERT INTO competition_events (
        achievement_id, name, organized_by, recognized_by, venue_name, city, district, state, country, level, format, age_group, start_date, end_date
      ) VALUES (
        $1, 'Maharashtra State Junior Athletics Championship', 'Maharashtra Athletics Association', 'Athletics Federation of India',
        'Shiv Chhatrapati Sports Complex', 'Pune', 'Pune', 'Maharashtra', 'India', 'State', 'Individual Track', 'Under-16',
        '2023-05-16', '2023-05-18'
      )
    `, [ach1Id]);
    await client.query(`
      INSERT INTO result_performances (
        achievement_id, result_type, final_position, total_participants, performance_value, measurement_unit, is_personal_best
      ) VALUES (
        $1, '1st Place (Gold Medal)', 1, 32, 10.92, 'seconds', false
      )
    `, [ach1Id]);

    // Ach 1 Document
    const doc1Hash = crypto.createHash('sha256').update('merit_certificate_state_2023').digest('hex');
    await client.query(`
      INSERT INTO documents (
        achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, uploaded_by, verification_status
      ) VALUES (
        $1, 'Merit Certificate', 'merit_certificate_state_2023.png', $2, 'image/png', 245000, $3, $4, 'verified'
      )
    `, [ach1Id, meritCertUrl, doc1Hash, userId]);

    // -------------------------------------------------------------
    // ACHIEVEMENT 2 (2023-09-15) — State Team Selection
    // -------------------------------------------------------------
    const ach2Res = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement,
        selected_for, selection_level, selection_authority, camp_team_start_date, camp_team_end_date
      ) VALUES (
        $1, 'selection', 'State Team Selection',
        'State Team Selection — National Sub-Junior Athletics Squad',
        'State', '2023-09-15',
        'Officially selected for Maharashtra State Sub-Junior Squad for 100m sprint and 4x100m relay.',
        'SEL-MH-2023-0842', 'verified', 7, $2, true, 15,
        'Maharashtra State Sub-Junior Athletics Squad (100m & 4x100m)', 'State Level', 'Maharashtra Athletics Selection Board',
        '2023-10-01', '2023-10-15'
      ) RETURNING id
    `, [athleteId, userId]);
    const ach2Id = ach2Res.rows[0].id;

    // Ach 2 Registration & Issuance
    const reg2Res = await client.query(`
      INSERT INTO achievement_registrations (
        achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date
      ) VALUES (
        $1, 'school', 'Priya Deshmukh, Sports Teacher', 'ZP School, Gadchiroli', '2023-09-18'
      ) RETURNING id
    `, [ach2Id]);
    await client.query(`
      INSERT INTO achievement_issuances (
        registration_id, issued_by, reference_number, issued_date, status
      ) VALUES (
        $1, 'Directorate of Sports & Youth Services, Maharashtra', 'SEL-MH-2023-0842', '2023-09-20', 'verified'
      )
    `, [reg2Res.rows[0].id]);

    // Ach 2 Document
    const doc2Hash = crypto.createHash('sha256').update('state_selection_letter_2023').digest('hex');
    await client.query(`
      INSERT INTO documents (
        achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, uploaded_by, verification_status
      ) VALUES (
        $1, 'Selection Letter', 'state_selection_letter_2023.png', $2, 'image/png', 312000, $3, $4, 'verified'
      )
    `, [ach2Id, selectionLetterUrl, doc2Hash, userId]);

    // -------------------------------------------------------------
    // ACHIEVEMENT 3 (2024-01-10) — Lakshyavedh Sports Scholarship
    // -------------------------------------------------------------
    const ach3Res = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement,
        scholarship_name, scholarship_provider, scholarship_amount, scholarship_currency,
        scholarship_frequency, scholarship_duration, scholarship_criteria
      ) VALUES (
        $1, 'scholarship', 'Govt. Sports Scholarship',
        'Lakshyavedh Sports Excellence Scholarship (Annual Stipend)',
        'State', '2024-01-10',
        'Awarded prestigious Lakshyavedh sports excellence scholarship grant of ₹60,000 per annum.',
        'SCH-MH-2024-0512', 'verified', 7, $2, true, 15,
        'Lakshyavedh Sports Excellence Scholarship', 'Dept. of Sports & Youth Services, Govt. of Maharashtra',
        60000, '₹', 'Annual', '12 Months (2024–2025)', 'State Championship Gold Medalist (Sub-Junior)'
      ) RETURNING id
    `, [athleteId, userId]);
    const ach3Id = ach3Res.rows[0].id;

    // Ach 3 Registration & Issuance
    const reg3Res = await client.query(`
      INSERT INTO achievement_registrations (
        achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date
      ) VALUES (
        $1, 'sports_academy', 'Sunil Gavali, Head of Sports', $2, '2024-01-12'
      ) RETURNING id
    `, [ach3Id, instituteName]);
    await client.query(`
      INSERT INTO achievement_issuances (
        registration_id, issued_by, reference_number, issued_date, status
      ) VALUES (
        $1, 'Government of Maharashtra - Sports Department', 'SCH-MH-2024-0512', '2024-01-15', 'verified'
      )
    `, [reg3Res.rows[0].id]);

    // Ach 3 Document
    const doc3Hash = crypto.createHash('sha256').update('scholarship_sanction_order_2024').digest('hex');
    await client.query(`
      INSERT INTO documents (
        achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, uploaded_by, verification_status
      ) VALUES (
        $1, 'Scholarship Sanction Order', 'scholarship_sanction_order_2024.svg', $2, 'image/svg+xml', 185000, $3, $4, 'verified'
      )
    `, [ach3Id, scholarshipUrl, doc3Hash, userId]);

    // -------------------------------------------------------------
    // ACHIEVEMENT 4 (2024-08-22) — Personal Best Record
    // -------------------------------------------------------------
    const ach4Res = await client.query(`
      INSERT INTO achievements (
        athlete_id, category, subtype, title, level, achievement_date,
        short_description, reference_number, verification_status, current_step,
        created_by, locked, age_at_achievement,
        prev_personal_best, new_personal_best, pb_improvement, pb_date, performance_value
      ) VALUES (
        $1, 'personal_best', 'Track Performance Record',
        '100m Sprint Personal Best Record — 10.74s',
        'National', '2024-08-22',
        'Clocked personal best timing of 10.74 seconds at West Zone Junior Athletics meet.',
        'AFI-WZ-2024-PB-771', 'verified', 7, $2, true, 16,
        '10.92s', '10.74s', '-0.18s (1.65%)', '2024-08-22', '10.74s'
      ) RETURNING id
    `, [athleteId, userId]);
    const ach4Id = ach4Res.rows[0].id;

    // Ach 4 Registration & Issuance
    const reg4Res = await client.query(`
      INSERT INTO achievement_registrations (
        achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date
      ) VALUES (
        $1, 'sports_academy', 'Priya Deshmukh, Sports Teacher', $2, '2024-08-25'
      ) RETURNING id
    `, [ach4Id, instituteName]);
    await client.query(`
      INSERT INTO achievement_issuances (
        registration_id, issued_by, reference_number, issued_date, status
      ) VALUES (
        $1, 'Athletics Federation of India', 'AFI-WZ-2024-PB-771', '2024-08-28', 'verified'
      )
    `, [reg4Res.rows[0].id]);

    // Ach 4 Competition & Result
    await client.query(`
      INSERT INTO competition_events (
        achievement_id, name, organized_by, recognized_by, venue_name, city, district, state, country, level, format, age_group, start_date, end_date
      ) VALUES (
        $1, 'West Zone Junior Athletics Championship', 'Athletics Federation of India', 'World Athletics',
        'Bambolim Stadium', 'Panaji', 'North Goa', 'Goa', 'India', 'National', 'Individual Track', 'Under-18',
        '2024-08-20', '2024-08-22'
      )
    `, [ach4Id]);
    await client.query(`
      INSERT INTO result_performances (
        achievement_id, result_type, final_position, total_participants, performance_value, measurement_unit, is_personal_best, previous_best
      ) VALUES (
        $1, 'Personal Best', 1, 24, 10.74, 'seconds', true, 10.92
      )
    `, [ach4Id]);

    // Ach 4 Document
    const doc4Hash = crypto.createHash('sha256').update('pb_timing_record_2024').digest('hex');
    await client.query(`
      INSERT INTO documents (
        achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, uploaded_by, verification_status
      ) VALUES (
        $1, 'Electronic Timing Slip', 'pb_timing_record_2024.png', $2, 'image/png', 198000, $3, $4, 'verified'
      )
    `, [ach4Id, meritCertUrl, doc4Hash, userId]);

    // -------------------------------------------------------------
    // ACHIEVEMENT 5 (2025-01-25) — Khelo India Youth Games 2025 Gold Medal & Meet Record
    // -------------------------------------------------------------
    const kheloCertSource = path.join(ARTIFACT_DIR, 'khelo_india_gold_certificate_1785616285288.png');
    const kheloCertUrl = saveAsset('khelo_india_2025_gold_medal_certificate.png', kheloCertSource);

    const ach5Res = await client.query(`
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
    const ach5Id = ach5Res.rows[0].id;

    // Ach 5 Registration & Issuance
    const reg5Res = await client.query(`
      INSERT INTO achievement_registrations (
        achievement_id, submitted_by_role, submitter_name, submitted_under, entry_date
      ) VALUES (
        $1, 'sports_academy', 'Sunil Gavali, Head of Sports & Chief Coach', $2, '2025-01-28'
      ) RETURNING id
    `, [ach5Id, instituteName]);
    await client.query(`
      INSERT INTO achievement_issuances (
        registration_id, issued_by, reference_number, issued_date, status
      ) VALUES (
        $1, 'Sports Authority of India & Ministry of Youth Affairs and Sports', 'KIYG-2025-ATH-GLD-088', '2025-02-01', 'verified'
      )
    `, [reg5Res.rows[0].id]);

    // Ach 5 Competition & Result
    await client.query(`
      INSERT INTO competition_events (
        achievement_id, name, organized_by, recognized_by, venue_name, city, district, state, country, level, format, age_group, start_date, end_date
      ) VALUES (
        $1, '7th Khelo India Youth Games 2025', 'Sports Authority of India (SAI)', 'Athletics Federation of India (AFI)',
        'Jawaharlal Nehru Stadium', 'Chennai', 'Chennai', 'Tamil Nadu', 'India', 'National', 'Individual Track (100m Sprint)', 'Under-18 Boys',
        '2025-01-22', '2025-01-25'
      )
    `, [ach5Id]);
    await client.query(`
      INSERT INTO result_performances (
        achievement_id, result_type, final_position, total_participants, performance_value, measurement_unit, is_personal_best, previous_best
      ) VALUES (
        $1, '1st Place (Gold Medal)', 1, 48, 10.62, 'seconds', true, 10.74
      )
    `, [ach5Id]);

    // Ach 5 Document
    const doc5Hash = crypto.createHash('sha256').update('khelo_india_2025_gold_medal_certificate').digest('hex');
    await client.query(`
      INSERT INTO documents (
        achievement_id, document_type, original_filename, storage_key, mime_type, file_size_bytes, sha256_hash, uploaded_by, verification_status
      ) VALUES (
        $1, 'National Gold Medal Certificate', 'khelo_india_2025_gold_medal_certificate.png', $2, 'image/png', 385000, $3, $4, 'verified'
      )
    `, [ach5Id, kheloCertUrl, doc5Hash, userId]);

    await client.query('COMMIT');
    console.log('🎉 Successfully registered detailed athlete Arjun Prakash Bhosale!');
    console.log('   - Athlete ID:', athleteId);
    console.log('   - MAI ID:', maiId);
    console.log('   - User Login:', username, '/ Athlete@123');
    console.log('   - Achievements registered:', [ach1Id, ach2Id, ach3Id, ach4Id, ach5Id]);
    console.log('   - Mindmap URL: http://localhost:3000/admin/ledger/athlete/' + athleteId + '/mindmap');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during athlete seeding:', err);
    throw err;
  } finally {
    client.release();
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
